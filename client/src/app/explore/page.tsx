"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Timer, ExternalLink } from "lucide-react";
import Link from "next/link";

const manuscripts = [
  {
    id: "MSK-001",
    title: "Sparse Attention Improves Ocean Eddy Forecasting",
    author: "0x8A3…91C2",
    field: "ML / Oceanography",
    cid: "bafybeigdyrci123",
    bounty: 420,
    deadlineDays: 10,
  },
  {
    id: "MSK-002",
    title: "Catalyst-Free Room Temp Ammonia Synthesis",
    author: "0x2c1…aa77",
    field: "Chemistry",
    cid: "bafybeigdyrci456",
    bounty: 300,
    deadlineDays: 7,
  },
];

export default function ExplorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Manuscripts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manuscripts.map((m) => (
          <motion.div key={m.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full bg-card/80 border-border backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg truncate">{m.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-2">
                  <Badge>{m.field}</Badge>
                  <span>Author {m.author}</span>
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground flex gap-3">
                  <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {m.deadlineDays} days</span>
                  <span className="flex items-center gap-1"><Coins className="w-4 h-4" /> {m.bounty} AXN</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <a href={`https://ipfs.io/ipfs/${m.cid}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Link href={`/review/${m.id}`}>
                    <Button size="sm" className="rounded-xl">Review</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
