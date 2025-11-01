import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

import { capitalizeWords } from "@/app/utils/capitalize-words";
import { truncateWithEllipsis } from "@/app/utils/truncate-with-ellipsis";
import { getQueryParam } from "@/app/utils/get-query-param";
import type { WeatherResponse, WeatherUnits } from "./types";
import { validateViewBox } from "@/app/utils/validate-view-box";

export async function GET(request: NextRequest) {
  const queryParams = request.nextUrl.searchParams;
  const viewBox = validateViewBox(
    getQueryParam(request.nextUrl.searchParams, "viewBox")
  );
  const units =
    (queryParams.get("units") as WeatherUnits)?.toLowerCase() || "standard";

  const openWeatherUrl = new URL(
    "https://api.openweathermap.org/data/2.5/weather"
  );

  queryParams.forEach((value, key) => {
    openWeatherUrl.searchParams.set(key, value);
  });

  const res = await fetch(openWeatherUrl.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return new Response(JSON.stringify(await res.json()), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = (await res.json()) as WeatherResponse;
  const isNight = data.weather?.[0]?.icon?.endsWith("n");

  const filePath = path.join(
    process.cwd(),
    "public",
    "icons",
    `${data.weather?.[0]?.icon}.svg`
  );

  const textColor = "#fff";

  const rawSvg = await fs.readFile(filePath, "utf-8").catch(() => "");
  const innerSvg = rawSvg.replace(/<svg[^>]*>|<\/svg>/g, "");

  const description = capitalizeWords(data.weather[0].description || "");

  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" height="130">
        <defs>
          <linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${isNight ? "#000621" : "#134282"}" />
            <stop offset="100%" stop-color="${
              isNight ? "#323b5a" : "#7ca1c5"
            }" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${viewBox.split(" ")[2]}" height="${
      viewBox.split(" ")[3]
    }" fill="url(#bgGradient)" rx="16" ry="16" />
        <text x="16" y="23" font-size="16" fill="${textColor}" text-anchor="start" font-family="Arial, sans-serif">
        ${truncateWithEllipsis(
          data.name,
          Math.floor(Number(viewBox.split(" ")[2]) / 10) - 1
        )}
        <title>${data.name}, ${data.sys.country}</title>
        </text>
        <text x="16" y="56" font-size="26" fill="${textColor}" text-anchor="start" font-family="Arial, sans-serif">
          ${Math.round(data.main.temp)}${
      units === "metric" ? "°C" : units === "imperial" ? "°F" : "K"
    }
        </text>
        <text x="16" y="72" font-size="12" fill="${textColor}" text-anchor="start" font-family="Arial, sans-serif">
          Feels like ${Math.round(data.main.feels_like)}${
      units === "metric" ? "°C" : units === "imperial" ? "°F" : "K"
    }
        </text>
        <g transform="translate(10,70) scale(0.7)">
          ${innerSvg}
        </g>
        <text x="16" y="120" font-size="12" fill="${textColor}" text-anchor="start" font-family="Arial, sans-serif">
          ${truncateWithEllipsis(description)}  
        ${description.length > 15 ? `<title>${description}</title>` : ""}
        </text>
      </svg>`,
    {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    }
  );
}
