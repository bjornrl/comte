"use client";

import Image from "next/image";
import BlobNav from "../components/BlobNav";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const GRID_ITEMS = [
    { title: "Item one" },
    { title: "Item two" },
    { title: "Item three" },
    { title: "Item four" },
    { title: "Item five" },
    { title: "Item six" },
    { title: "Item seven" },
    { title: "Item eight" },
];

export default function ProjectPage() {
    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-white">
                <h1 className="text-5xl font-light text-black">Projects</h1>
            </div>
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-white pt-2 pb-2"
                style={{ height: "calc(100vh - 5rem)" }}
            >
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">1</span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">2</span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">3</span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">4</span>
                </div>
            </div>
        </div>
    );
}
