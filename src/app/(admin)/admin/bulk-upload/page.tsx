"use client";

import React, { useState } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function BulkUploadPage() {
    const [jsonData, setJsonData] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleUpload = async () => {
        setIsUploading(true);
        setResult(null);

        try {
            const data = JSON.parse(jsonData);
            const profiles = Array.isArray(data) ? data : [data];

            const { error } = await supabase
                .from('agents')
                .insert(profiles);

            if (error) throw error;

            setResult({ success: true, message: `Successfully uploaded ${profiles.length} agent profiles.` });
            setJsonData('');
        } catch (err: unknown) {
            const error = err as Error;
            setResult({ success: false, message: error.message || 'Invalid JSON format or database error.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-6">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="rounded-xl border border-stone/10 h-12 w-12 hover:bg-primary/5">
                        <ArrowLeft className="w-5 h-5 text-gray-900" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">
                        Bulk <span className="text-primary">Upload</span>
                    </h1>
                    <p className="text-stone font-medium italic">&quot;Batch import profiles directly into the directory.&quot;</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <Card className="border-stone/5 rounded-[3rem] bg-white shadow-soft overflow-hidden">
                        <CardContent className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <FileJson className="w-4 h-4 text-primary" />
                                    JSON Data
                                </label>
                                <Textarea
                                    className="min-h-[400px] rounded-2xl border-stone/10 font-mono text-xs p-6 bg-warm/20"
                                    placeholder='[\n  {\n    "business_name": "Example Agency",\n    "slug": "example-agency",\n    "primary_suburb": "Sydney",\n    "primary_state": "NSW",\n    "years_experience": 10,\n    "licence_verified": true\n  }\n]'
                                    value={jsonData}
                                    onChange={(e) => setJsonData(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={isUploading || !jsonData.trim()}
                                className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-teal/20 flex items-center justify-center text-lg gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {isUploading ? 'Uploading...' : 'Finalize Upload'}
                            </Button>
                        </CardContent>
                    </Card>

                    {result && (
                        <div className={cn(
                            "p-6 rounded-2xl flex items-center gap-4 border animate-in slide-in-from-bottom duration-300",
                            result.success ? "bg-verified/5 border-verified/20 text-verified" : "bg-primary/5 border-primary/20 text-primary"
                        )}>
                            {result.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <p className="font-bold text-sm tracking-tight">{result.message}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Import Instructions</h2>
                    <div className="space-y-6">
                        <section className="space-y-4">
                            <h3 className="text-xs font-black text-stone/40 uppercase tracking-widest">Required Fields</h3>
                            <ul className="space-y-2">
                                {['business_name', 'slug', 'primary_suburb', 'primary_state'].map(f => (
                                    <li key={f} className="flex items-center gap-3 text-gray-900 font-mono text-xs">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section className="space-y-4 bg-gray-900 text-white p-8 rounded-[2.5rem]">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Data Safety</h3>
                            <p className="text-sm font-medium leading-relaxed">
                                Ensure your JSON is formatted as an array. The system will automatically check for duplicate slugs. Verified status defaults to true if omitted.
                            </p>
                            <div className="pt-4 flex items-center gap-2 text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" />
                                Encrypted &amp; Secure Transfer
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

