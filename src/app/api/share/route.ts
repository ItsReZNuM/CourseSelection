import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function generateId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: Request) {
    try {
        const { courses } = await req.json();

        if (!courses || !Array.isArray(courses)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        let id = generateId();

        let exists = await redis.exists(`schedule:${id}`);
        while (exists) {
            id = generateId();
            exists = await redis.exists(`schedule:${id}`);
        }

        await redis.set(`schedule:${id}`, JSON.stringify(courses), { ex: 60 * 60 * 24 * 270 });

        return NextResponse.json({ id });
    } catch (error) {
        console.error("Redis save error:", error);
        return NextResponse.json({ error: "Failed to store schedule" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const data = await redis.get(`schedule:${id}`);

        if (!data) {
            return NextResponse.json({ error: "Schedule not found or expired" }, { status: 404 });
        }

        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        return NextResponse.json({ courses: parsed });
    } catch (error) {
        console.error("Redis read error:", error);
        return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }
}