"use client";

import BlobNav from "../../components/BlobNav";

export default function ArticleListPage() {
    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full min-h-screen bg-background px-24 py-32">
                <h1 className="text-5xl font-light text-foreground">Articles</h1>
            </div>
        </div>
    );
}
