import {useNotifications} from '@/hooks/useNotifications.ts';
import {useEffect, useRef, useState} from 'react';
import {AddressManagementService} from '@/api';
import { motion } from 'framer-motion';

export const AddAddressModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const { addNotification } = useNotifications();
    const [addressLabel, setAddressLabel] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [touched, setTouched] = useState({ addressLabel: false, city: false, country: false, streetAddress: false, postalCode: false });
    const [submitting, setSubmitting] = useState(false);

    const ignoreBlur = useRef(false);
    const suppressNextBlurRef = useRef(false);
    useEffect(() => {
      const onWinBlur = () => { suppressNextBlurRef.current = true; };
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') suppressNextBlurRef.current = true;
      };
      window.addEventListener('blur', onWinBlur);
      document.addEventListener('visibilitychange', onVisibility);
      return () => {
        window.removeEventListener('blur', onWinBlur);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    }, []);

    const labelRef = useRef<HTMLInputElement | null>(null);
    const cityRef = useRef<HTMLInputElement | null>(null);
    const countryRef = useRef<HTMLInputElement | null>(null);
    const streetRef = useRef<HTMLInputElement | null>(null);
    const postalRef = useRef<HTMLInputElement | null>(null);
    const validate = () => {
      const newErrors: { [k: string]: string } = {};
      if (!addressLabel.trim()) newErrors.addressLabel = 'Обязательное поле';
      if (!city.trim()) newErrors.city = 'Обязательное поле';
      if (!country.trim()) newErrors.country = 'Обязательное поле';
      if (!streetAddress.trim()) newErrors.streetAddress = 'Обязательное поле';
      if (!postalCode.trim()) newErrors.postalCode = 'Обязательное поле';
      return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
      const newErrors: { [k: string]: string } = {};
      if (touched.addressLabel && !addressLabel.trim()) newErrors.addressLabel = 'Обязательное поле';
      if (touched.city && !city.trim()) newErrors.city = 'Обязательное поле';
      if (touched.country && !country.trim()) newErrors.country = 'Обязательное поле';
      if (touched.streetAddress && !streetAddress.trim()) newErrors.streetAddress = 'Обязательное поле';
      if (touched.postalCode && !postalCode.trim()) newErrors.postalCode = 'Обязательное поле';
      setErrors(newErrors);
    }, [addressLabel, city, country, streetAddress, postalCode, touched]);

    const isValid = () => (
      addressLabel.trim() &&
      city.trim() &&
      country.trim() &&
      streetAddress.trim() &&
      postalCode.trim()
    );

    const handleSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!validate()) {
        setTouched({ addressLabel: true, city: true, country: true, streetAddress: true, postalCode: true });
        return;
      }
      setSubmitting(true);
      setErrors({});
      try {
        await AddressManagementService.createAddress({
          addressLabel: addressLabel.trim(),
          city: city.trim(),
          country: country.trim(),
          streetAddress: streetAddress.trim(),
          postalCode: postalCode.trim(),
        } as any);
        addNotification('Адрес добавлен', 'success');
        onSuccess();
      } catch (err: any) {
        addNotification(err?.message || 'Ошибка при создании адреса', 'error');
      } finally {
        setSubmitting(false);
      }
    };

    // Trap TAB between inputs only
    const focusables = [labelRef, cityRef, countryRef, streetRef, postalRef];
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const idx = focusables.findIndex(r => r.current === document.activeElement);
        const delta = e.shiftKey ? -1 : 1;
        const next = (idx + delta + focusables.length) % focusables.length;
        focusables[next].current?.focus();
      }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-black/40"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                  ignoreBlur.current = true;
                }
              }}
              onTouchStart={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                  ignoreBlur.current = true;
                }
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                  e.preventDefault();
                  onClose();
                  setTimeout(() => { ignoreBlur.current = false; }, 300);
                }
              }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-[520px] max-w-[90vw] bg-white rounded-[12px] p-6 shadow-xl"
              onKeyDown={onKeyDown}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
            >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Закрыть"
                  onMouseDown={() => { ignoreBlur.current = true; }}
                  onTouchStart={() => { ignoreBlur.current = true; }}
                  onClick={() => { onClose(); setTimeout(() => { ignoreBlur.current = false; }, 300); }}
                  className="absolute top-4 right-4 text-gray-500 text-xl cursor-pointer disabled:opacity-40"
                >
                  ✕
                </button>
                {/* Header */}
                <div className="-mx-6 px-6 mb-6 border-b border-[#CCCCCC] pb-4">
                    <h3 className="text-[16px] leading-[18px] uppercase font-semibold text-left">Добавить адрес</h3>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="block">
                        <span className="text-[12px] uppercase">Название адреса <span className="text-red-500">*</span></span>
                        <input
                          ref={labelRef}
                          className={`mt-2 w-full h-[56px] border rounded px-4 outline-none ${errors.addressLabel ? 'border-red-400' : 'border-[#CCC]'}`}
                          placeholder="Дайте имя этому адресу"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          onBlur={() => {
                            if (ignoreBlur.current) return;
                            if (document.visibilityState === 'hidden' || !document.hasFocus() || suppressNextBlurRef.current) {
                              suppressNextBlurRef.current = false;
                              return;
                            }
                            setTouched((t) => ({ ...t, addressLabel: true }));
                          }}
                          autoFocus
                        />
                    </label>

                    <label className="block">
                        <span className="text-[12px] uppercase">Страна <span className="text-red-500">*</span></span>
                        <input
                            ref={countryRef}
                            className={`mt-2 w-full h-[56px] border rounded px-4 outline-none ${errors.country ? 'border-red-400' : 'border-[#CCC]'}`}
                            placeholder="Введите страну"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            onBlur={() => {
                                if (ignoreBlur.current) return;
                                if (document.visibilityState === 'hidden' || !document.hasFocus() || suppressNextBlurRef.current) {
                                    suppressNextBlurRef.current = false;
                                    return;
                                }
                                setTouched((t) => ({ ...t, country: true }));
                            }}
                        />
                    </label>

                    <label className="block">
                        <span className="text-[12px] uppercase">Населенный пункт <span className="text-red-500">*</span></span>
                        <input
                          ref={cityRef}
                          className={`mt-2 w-full h-[56px] border rounded px-4 outline-none ${errors.city ? 'border-red-400' : 'border-[#CCC]'}`}
                          placeholder="Введите название города"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          onBlur={() => {
                            if (ignoreBlur.current) return;
                            if (document.visibilityState === 'hidden' || !document.hasFocus() || suppressNextBlurRef.current) {
                              suppressNextBlurRef.current = false;
                              return;
                            }
                            setTouched((t) => ({ ...t, city: true }));
                          }}
                        />
                    </label>

                    <label className="block">
                        <span className="text-[12px] uppercase">Адрес <span className="text-red-500">*</span></span>
                        <input
                          ref={streetRef}
                          className={`mt-2 w-full h-[56px] border rounded px-4 outline-none ${errors.streetAddress ? 'border-red-400' : 'border-[#CCC]'}`}
                          placeholder="Введите улицу, дом и квартиру"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          onBlur={() => {
                            if (ignoreBlur.current) return;
                            if (document.visibilityState === 'hidden' || !document.hasFocus() || suppressNextBlurRef.current) {
                              suppressNextBlurRef.current = false;
                              return;
                            }
                            setTouched((t) => ({ ...t, streetAddress: true }));
                          }}
                        />
                    </label>

                    <label className="block">
                        <span className="text-[12px] uppercase">Почтовый индекс <span className="text-red-500">*</span></span>
                        <input
                          ref={postalRef}
                          className={`mt-2 w-full h-[56px] border rounded px-4 outline-none ${errors.postalCode ? 'border-red-400' : 'border-[#CCC]'}`}
                          placeholder="Введите почтовый индекс вашего адреса"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          onBlur={() => {
                            if (ignoreBlur.current) return;
                            if (document.visibilityState === 'hidden' || !document.hasFocus() || suppressNextBlurRef.current) {
                              suppressNextBlurRef.current = false;
                              return;
                            }
                            setTouched((t) => ({ ...t, postalCode: true }));
                          }}
                        />
                    </label>

                    <div className="mt-[20px]" />
                    <div className="mt-[40px]" />
                    <button
                        type="submit"
                        disabled={submitting || !isValid()}
                        tabIndex={-1}
                        className={`w-full h-[56px] border border-[#FFFBF5] rounded bg-[#F8C6D7] text-[14px] leading-[18px] uppercase ${!submitting && isValid() ? 'cursor-pointer hover:shadow-md transition transition-transform active:scale-95 active:opacity-90' : 'cursor-not-allowed opacity-50 pointer-events-none'}`}
                    >
                        Добавить адрес
                    </button>
                </form>
            </motion.div>
        </div>
    );
};