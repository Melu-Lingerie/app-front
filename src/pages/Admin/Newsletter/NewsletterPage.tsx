import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import {
    AdminHeader,
    AdminButton,
    AdminInput,
    AdminTextarea,
} from '../components';
import api from '@/axios/api';

export function NewsletterPage() {
    const [subject, setSubject] = useState('');
    const [htmlBody, setHtmlBody] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ sentCount: number; failedCount: number; message: string } | null>(null);
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

    useEffect(() => {
        api.get('/admin/newsletter/subscribers/count')
            .then(res => setSubscriberCount(res.data.count))
            .catch(() => setSubscriberCount(0));
    }, []);

    const handleSend = async () => {
        if (!subject.trim() || !htmlBody.trim()) return;
        if (!confirm(`Вы уверены, что хотите отправить рассылку${subscriberCount != null ? ` ${subscriberCount} подписчикам` : ''}?`)) return;

        setSending(true);
        setResult(null);
        try {
            const res = await api.post('/admin/newsletter/send', { subject: subject.trim(), htmlBody: htmlBody.trim() });
            setResult(res.data);
        } catch (err) {
            setResult({ sentCount: 0, failedCount: 0, message: 'Ошибка при отправке рассылки' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <AdminHeader
                title="Email рассылка"
                subtitle={`Активных подписчиков: ${subscriberCount ?? 0}`}
            />

            <div className="space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Новая рассылка</h2>

                    <div className="space-y-4">
                        <AdminInput
                            label="Тема письма"
                            placeholder="Например: Новая коллекция уже в продаже!"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />

                        <AdminTextarea
                            label="Содержимое письма (HTML)"
                            placeholder="<h1>Заголовок</h1><p>Текст письма...</p>"
                            value={htmlBody}
                            onChange={(e) => setHtmlBody(e.target.value)}
                            rows={15}
                        />

                        {/* Preview */}
                        {htmlBody.trim() && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Предпросмотр
                                </label>
                                <div
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white"
                                    dangerouslySetInnerHTML={{ __html: htmlBody }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <AdminButton
                            onClick={handleSend}
                            disabled={sending || !subject.trim() || !htmlBody.trim()}
                            icon={<Send size={18} />}
                        >
                            {sending ? 'Отправка...' : 'Отправить рассылку'}
                        </AdminButton>
                    </div>

                    {result && (
                        <div className={`mt-4 p-4 rounded-lg border ${
                            result.failedCount > 0
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
                                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                        }`}>
                            <p>{result.message}</p>
                            <p className="text-sm mt-1">Отправлено: {result.sentCount}, ошибок: {result.failedCount}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
