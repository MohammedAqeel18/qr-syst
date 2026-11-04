
import type { RequestHandler } from "express";
import { ScanEventModel } from "../models/scanEvent.model.js";
import { QRCodeModel } from "../models/qrcode.model.ts";

interface DailyScanResult {
  _id: string;
  count: number;
}

// --------------------------------------------------
// Helper 1: Build the last seven days of scan data
// --------------------------------------------------

function buildLastSevenDays(
  dailyResults: DailyScanResult[],
  startDate: Date
) {
  const scanCounts = new Map(
    dailyResults.map((item) => [item._id, item.count])
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);

    date.setUTCDate(date.getUTCDate() + index);

    const dateKey = date.toISOString().slice(0, 10);

    return {
      date: dateKey,
      count: scanCounts.get(dateKey) ?? 0,
    };
  });
}

// --------------------------------------------------
// Helper 2: Convert timestamps into Qatar local time
// --------------------------------------------------

function formatQatarDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Qatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

// --------------------------------------------------
// Helper 3: Protect CSV values
// --------------------------------------------------

function escapeCSV(value: unknown): string {
  const text = String(value ?? "");

  // Prevent spreadsheet formula injection.
  const safeText = /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;

  // Escape double quotes and wrap the value in quotes.
  return `"${safeText.replace(/"/g, '""')}"`;
}

// --------------------------------------------------
// 1. Get overall analytics summary
// --------------------------------------------------

export const getAnalyticsSummary: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    const startDate = new Date();

    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [result] = await ScanEventModel.aggregate([
      {
        $facet: {
          total: [
            { $count: "count" },
          ],

          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 },
              },
            },
          ],

          daily: [
            {
              $match: {
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC",
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
        },
      },
    ]);

    const deviceCounts: Record<string, number> = {
      ios: 0,
      android: 0,
      other: 0,
    };

    for (const item of result?.byDevice ?? []) {
      deviceCounts[item._id] = item.count;
    }

    res.status(200).json({
      success: true,
      data: {
        totalScans: result?.total[0]?.count ?? 0,
        iosScans: deviceCounts.ios,
        androidScans: deviceCounts.android,
        otherScans: deviceCounts.other,

        dailyScans: buildLastSevenDays(
          result?.daily ?? [],
          startDate
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// 2. Get analytics for one QR code
// --------------------------------------------------

export const getQRCodeAnalytics: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { qrId } = req.params;

    if (
      typeof qrId !== "string" ||
      !/^[a-f0-9]{32}$/i.test(qrId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid QR code ID.",
      });

      return;
    }

    const qrCode = await QRCodeModel.findOne({ qrId }).lean();

    if (!qrCode) {
      res.status(404).json({
        success: false,
        message: "QR code not found.",
      });

      return;
    }

    const startDate = new Date();

    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [result] = await ScanEventModel.aggregate([
      {
        $match: { qrId },
      },
      {
        $facet: {
          total: [
            { $count: "count" },
          ],

          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 },
              },
            },
          ],

          daily: [
            {
              $match: {
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC",
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
        },
      },
    ]);

    const deviceCounts: Record<string, number> = {
      ios: 0,
      android: 0,
      other: 0,
    };

    for (const item of result?.byDevice ?? []) {
      deviceCounts[item._id] = item.count;
    }

    res.status(200).json({
      success: true,
      data: {
        qrCode: {
          qrId: qrCode.qrId,
          name: qrCode.name,
          isActive: qrCode.isActive,
        },

        totalScans: result?.total[0]?.count ?? 0,
        iosScans: deviceCounts.ios,
        androidScans: deviceCounts.android,
        otherScans: deviceCounts.other,

        dailyScans: buildLastSevenDays(
          result?.daily ?? [],
          startDate
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// 3. Export analytics as CSV
// --------------------------------------------------

export const exportAnalyticsCSV: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { startDate, endDate, qrId } = req.query;

    // Validate date parameters.
    if (
      typeof startDate !== "string" ||
      typeof endDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Valid startDate and endDate are required (YYYY-MM-DD).",
      });

      return;
    }

    // Validate actual calendar dates.
    const startCalendarDate = new Date(
      `${startDate}T00:00:00.000Z`
    );

    const endCalendarDate = new Date(
      `${endDate}T00:00:00.000Z`
    );

    if (
      Number.isNaN(startCalendarDate.getTime()) ||
      Number.isNaN(endCalendarDate.getTime()) ||
      startCalendarDate.toISOString().slice(0, 10) !== startDate ||
      endCalendarDate.toISOString().slice(0, 10) !== endDate
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid calendar date.",
      });

      return;
    }

    // Reject a start date later than the end date.
    if (startCalendarDate > endCalendarDate) {
      res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });

      return;
    }

    // Calculate the selected calendar period.
    const dayDifference =
      (endCalendarDate.getTime() -
        startCalendarDate.getTime()) / 86400000;

    // Maximum inclusive reporting period: 366 days.
    if (dayDifference > 365) {
      res.status(400).json({
        success: false,
        message: "The maximum export period is 366 days.",
      });

      return;
    }

    // Convert Qatar local midnight into UTC timestamps.
    // Qatar uses UTC+3.
    const start = new Date(
      `${startDate}T00:00:00+03:00`
    );

    const end = new Date(
      `${endDate}T00:00:00+03:00`
    );

    // Include the entire selected end date.
    // MongoDB uses an exclusive upper boundary.
    const endExclusive = new Date(end);

    endExclusive.setUTCDate(
      endExclusive.getUTCDate() + 1
    );

    // Build MongoDB filter.
    const filter: {
      createdAt: { $gte: Date; $lt: Date };
      qrId?: string;
    } = {
      createdAt: {
        $gte: start,
        $lt: endExclusive,
      },
    };

    // Optional individual QR code filter.
    if (qrId !== undefined) {
      if (
        typeof qrId !== "string" ||
        !/^[a-f0-9]{32}$/i.test(qrId)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid QR code ID.",
        });

        return;
      }

      const qrCode = await QRCodeModel.findOne({ qrId })
        .select("qrId")
        .lean();

      if (!qrCode) {
        res.status(404).json({
          success: false,
          message: "QR code not found.",
        });

        return;
      }

      filter.qrId = qrId;
    }

    // Retrieve at most 50,001 records.
    // The extra record detects an oversized report.
    const scans = await ScanEventModel.find(filter)
      .sort({ createdAt: 1 })
      .limit(50001)
      .lean();

    if (scans.length > 50000) {
      res.status(413).json({
        success: false,
        message:
          "This report contains more than 50,000 scans. Please select a shorter date range.",
      });

      return;
    }

    // Get QR code names for the exported records.
    const qrIds = [
      ...new Set(scans.map((scan) => scan.qrId)),
    ];

    const qrCodes = await QRCodeModel.find({
      qrId: { $in: qrIds },
    })
      .select("qrId name")
      .lean();

    const qrNameMap = new Map(
      qrCodes.map((qr) => [qr.qrId, qr.name])
    );

    // CSV column headings.
    const headers = [
      "Scan ID",
      "QR Code Name",
      "QR Code ID",
      "Device Type",
      "Scan Date (Qatar)",
      "Scan Time (Qatar)",
      "User Agent",
    ];

    // Convert scan records into CSV rows.
    const rows = scans.map((scan) => {
      const timestamp = new Date(scan.createdAt);

      const qatarDateTime = formatQatarDateTime(timestamp);

      return [
        scan._id.toString(),
        qrNameMap.get(scan.qrId) ?? "Deleted QR Code",
        scan.qrId,
        scan.deviceType,
        qatarDateTime.date,
        qatarDateTime.time,
        scan.userAgent,
      ];
    });

    // Generate CSV content.
    const csv = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    // Generate a meaningful filename.
    const filename = qrId
      ? `qr-${qrId}-analytics-${startDate}-to-${endDate}.csv`
      : `qr-analytics-${startDate}-to-${endDate}.csv`;

    // Send CSV download response.
    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // BOM helps spreadsheet applications recognize UTF-8.
    res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    next(error);
  }
};
