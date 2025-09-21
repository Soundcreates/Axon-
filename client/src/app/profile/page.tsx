"use client";

import WaveBackdrop from "@/components/WaveBackdrop";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea, Badge } from "@/components/ui";
import { useState } from "react";
import { User, GraduationCap, Link2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <WaveBackdrop />

      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl grid place-items-center bg-gradient-to-br from-primary/80 to-secondary/80">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Your Profile</div>
              <div className="text-xs text-muted-foreground">Wallet-linked, with optional public info</div>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-xl">Reputation: 72</Badge>
        </div>
      </header>

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-card/70 border-border backdrop-blur">
            <CardHeader>
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Display Name</Label>
                <Input placeholder="Ada Lovelace" className="mt-1" />
              </div>
              <div>
                <Label>Affiliation</Label>
                <Input placeholder="KJSCE" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label>Short Bio</Label>
                <Textarea rows={5} placeholder="I work on deep learning for chemistry & bioinformatics." className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-card/70 border-border backdrop-blur">
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>ORCID</Label>
                <div className="flex gap-2">
                  <Input placeholder="0000-0000-0000-0000" className="mt-1" />
                  <Button variant="outline" className="mt-1"><Link2 className="w-4 h-4 mr-2" /> Verify</Button>
                </div>
              </div>
              <div>
                <Label>Google Scholar</Label>
                <Input placeholder="https://scholar.google.com/citations?user=..." className="mt-1" />
              </div>
              <div>
                <Label>GitHub</Label>
                <Input placeholder="https://github.com/yourname" className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-card/70 border-border backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> Expertise & Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Primary Areas (comma-separated)</Label>
                <Input placeholder="deep learning, chemistry, bioinformatics" className="mt-1" />
              </div>
              <div>
                <Label>Secondary Areas</Label>
                <Input placeholder="graph ml, drug discovery" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label>Representative Publications (titles or URLs)</Label>
                <Textarea rows={4} placeholder="1) Title …&#10;2) Title …&#10;3) Title …" className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-3 flex justify-end">
          <Button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800); }}>
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </motion.main>
    </div>
  );
}
