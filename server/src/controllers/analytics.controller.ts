import mongoose from "mongoose";
import type { RequestHandler } from "express";
import { ScanEventModel } from "../models/scanEvent.model.js";
import { QRCodeModel } from "../models/qrcode.model.ts";



interface DailyScanResult {
  _id: string;
  count: number;
}

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
            { $count: "count" }
          ],

  
          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 }
              }
            }
          ],

          daily: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC"
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            }
          ]
        }
      }
    ]);

    const deviceCounts: Record<string, number> = {
      ios: 0,
      android: 0,
      other: 0
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
        )
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getQRCodeAnalytics: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { qrId } = req.params;

    if (typeof qrId !== "string" || !/^[a-f0-9]{32}$/i.test(qrId)) {
      res.status(400).json({
        success: false,
        message: "Invalid QR code ID."
      });
      return;
    }


    const qrCode = await QRCodeModel.findOne({ qrId }).lean();

    if (!qrCode) {
      res.status(404).json({
        success: false,
        message: "QR code not found."
      });
      return;
    }

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [result] = await ScanEventModel.aggregate([
      {
        $match: { qrId }
      },
      {
        $facet: {
          total: [
            { $count: "count" }
          ],
          byDevice: [
            {
              $group: {
                _id: "$deviceType",
                count: { $sum: 1 }
              }
            }
          ],
          daily: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC"
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: 1 }
            }
          ]
        }
      }
    ]);

    const deviceCounts: Record<string, number> = {
      ios: 0,
      android: 0,
      other: 0
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
          isActive: qrCode.isActive
        },
        totalScans: result?.total[0]?.count ?? 0,
        iosScans: deviceCounts.ios,
        androidScans: deviceCounts.android,
        otherScans: deviceCounts.other,
        dailyScans: buildLastSevenDays(
  result?.daily ?? [],
  startDate
)
      }
    });
  } catch (error) {
    next(error);
  }
};

function escapeCSV(value: unknown): string {
  const text = String(value ?? "");

  // Prevent CSV formula injection in spreadsheet applications.
  const safeText = /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;

  return `"${safeText.replace(/"/g, '""')}"`;
}

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
        message: "Valid startDate and endDate are required (YYYY-MM-DD).",
      });
      return;
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    // Reject impossible dates such as February 30.
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.toISOString().slice(0, 10) !== startDate ||
      end.toISOString().slice(0, 10) !== endDate
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid calendar date.",
      });
      return;
    }

    if (start > end) {
      res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
      return;
    }

    // Limit exports to a maximum of 366 calendar days.
    const dayDifference =
      (end.getTime() - start.getTime()) / 86400000;

    if (dayDifference > 365) {
      res.status(400).json({
        success: false,
        message: "The maximum export period is 366 days.",
      });
      return;
    }

    // End date is exclusive in MongoDB filtering.
    const endExclusive = new Date(end);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

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

    const headers = [
      "Scan ID",
      "QR Code Name",
      "QR Code ID",
      "Device Type",
      "Scan Date",
      "Scan Time",
      "User Agent",
    ];

    const rows = scans.map((scan) => {
      const timestamp = new Date(scan.createdAt);

      return [
        scan._id.toString(),
        qrNameMap.get(scan.qrId) ?? "Deleted QR Code",
        scan.qrId,
        scan.deviceType,
        timestamp.toISOString().slice(0, 10),
        timestamp.toISOString().slice(11, 19),
        scan.userAgent,
      ];
    });

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const filename = qrId
      ? `qr-${qrId}-analytics-${startDate}-to-${endDate}.csv`
      : `qr-analytics-${startDate}-to-${endDate}.csv`;

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );


    res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    next(error);
  }
};