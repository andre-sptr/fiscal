import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
// Note: ScrollArea di-remove karena diganti native div agar lebih stabil
import { useLanguage } from '@/hooks/useLanguage';
import { Shield, Lock, Eye, Mail } from 'lucide-react';

interface PrivacyPolicySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicySheet = ({ open, onOpenChange }: PrivacyPolicySheetProps) => {
    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* CONTAINER UTAMA:
                1. max-h-[85vh]: Tinggi maksimal 85% layar.
                2. flex-col: Susunan vertikal.
                3. overflow-hidden: Mencegah scroll di container luar.
            */}
            <DialogContent className="max-w-xl max-h-[85vh] w-full p-0 flex flex-col glass-panel overflow-hidden border border-border/30">

                {/* HEADER:
                   shrink-0: Wajib ada agar header tidak mengecil/gepeng saat konten panjang 
                */}
                <DialogHeader className="p-6 pb-4 border-b border-border/30 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-500" />
                        </div>
                        {t('settings.privacyPolicy')}
                    </DialogTitle>
                </DialogHeader>

                {/* CONTENT AREA (PENGGANTI SCROLLAREA):
                    1. flex-1: Mengambil sisa ruang tinggi yang tersedia.
                    2. overflow-y-auto: Mengaktifkan scrollbar jika konten melebihi tinggi.
                */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-8">

                        {/* Intro */}
                        <div className="glass-card p-5 border-l-4 border-l-primary">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {t('privacy.intro')}
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-6">
                            {/* Data Collection */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <Eye className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-1">{t('privacy.dataCollection')}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t('privacy.dataCollectionDesc')}
                                    </p>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Lock className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-1">{t('privacy.security')}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t('privacy.securityDesc')}
                                    </p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-1">{t('privacy.contact')}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t('privacy.contactDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-8 border-t border-border/10 text-center">
                            <p className="text-xs text-muted-foreground">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};