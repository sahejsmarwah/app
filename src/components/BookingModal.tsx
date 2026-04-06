import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, MessageSquare, CreditCard, ChevronRight, Check, Phone, Loader2, Clock } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialServiceId?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialServiceId }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        service: 'bridal',
        notes: ''
    });

    useEffect(() => {
        if (isOpen && initialServiceId) {
            setFormData(prev => ({ ...prev, service: initialServiceId }));
            setStep(2);
        } else if (isOpen) {
            setStep(1);
        }
        if (!isOpen) {
            // reset when modal closes
            setBookingStatus('idle');
            setAvailableSlots([]);
            setSlotsError('');
        }
    }, [isOpen, initialServiceId]);

    // Fetch available slots whenever the date changes
    useEffect(() => {
        if (!formData.date) {
            setAvailableSlots([]);
            return;
        }

        // Default time slots used when the calendar API is unavailable (local dev / no Google creds)
        const DEFAULT_SLOTS = ['10:00', '12:00', '14:00', '16:00'];

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlotsError('');
            setFormData(prev => ({ ...prev, time: '' }));
            try {
                const res = await fetch(`/api/calendar-availability?date=${formData.date}`);
                if (res.ok) {
                    const data = await res.json();
                    const slots = data.slots || [];
                    if (slots.length === 0) {
                        setSlotsError('No slots available on this date. Please try another date.');
                    } else {
                        setAvailableSlots(slots);
                    }
                } else {
                    // API returned an error — use default slots
                    console.warn('Calendar API error, using default slots');
                    setAvailableSlots(DEFAULT_SLOTS);
                }
            } catch {
                // API unreachable (local dev) — use default slots
                console.warn('Calendar API unreachable, using default slots');
                setAvailableSlots(DEFAULT_SLOTS);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [formData.date]);

    const services = [
        { id: 'bridal', name: 'Bridal Artistry', price: '₹15,000', deposit: '₹2,000' },
        { id: 'event', name: 'Events & Editorial', price: '₹8,500', deposit: '₹1,500' },
        { id: 'consult', name: 'Consultation', price: '₹4,500', deposit: '₹500' }
    ];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    // helper: format "14:00" → "2:00 PM"
    const formatTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hr = h % 12 || 12;
        return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    // minimum selectable date = tomorrow
    const minDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    })();

    const handlePayment = async () => {
        setIsSubmitting(true);
        try {
            const service = services.find(s => s.id === formData.service);
            if (!service) throw new Error('Service not found');

            // 1. Create booking via API
            const bookingRes = await fetch('/api/create-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const booking = await bookingRes.json();

            if (!booking.success) throw new Error('Failed to create booking');

            // 2. Create Razorpay Order
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(service.deposit.replace(/[^0-9]/g, '')),
                    currency: 'INR',
                    receipt: `receipt_${booking.id}`
                }),
            });
            const order = await orderRes.json();

            // 3. Open Razorpay Checkout
            const options = {
                key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: "Makeovers by Simran",
                description: `Deposit for ${service.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 4. Verify Payment
                    const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: booking.id
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.status === 'ok') {
                        setBookingStatus('success');
                        setStep(4);
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#be6d7d",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert('Payment failed: ' + response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error('Booking Error:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                     <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-white rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex h-2 bg-gray-100">
                            <motion.div
                                className="bg-rose"
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                         <div className="p-5 sm:p-8 md:p-12">
                            {/* Step 1 — Service Selection */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                     <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">Select Service</h2>
                                    <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 font-medium">Choose the experience you're looking for.</p>

                                    <div className="space-y-4">
                                        {services.map((s) => (
                                            <button
                                                key={s.id}
                                                 onClick={() => {
                                                    setFormData({ ...formData, service: s.id });
                                                    handleNext();
                                                }}
                                                className={`w-full p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${formData.service === s.id ? 'border-rose bg-rose/5' : 'border-gray-100 hover:border-peach'
                                                    }`}
                                            >
                                                <div>
                                                    <div className={`font-bold transition-colors ${formData.service === s.id ? 'text-rose' : 'text-gray-800'}`}>{s.name}</div>
                                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Starting from {s.price}</div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${formData.service === s.id ? 'bg-rose text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-peach group-hover:text-white'
                                                    }`}>
                                                    <ChevronRight size={18} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 — Details + Date/Time */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                     <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">Details & Schedule</h2>
                                    <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 font-medium">Tell us about yourself and pick a date & time.</p>

                                    <div className="space-y-5">
                                        <div className="relative">
                                            <User className="absolute left-4 top-4 text-gray-300" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-4 text-gray-300" size={20} />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all"
                                            />
                                        </div>

                                        {/* Date picker */}
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-4 text-gray-300" size={20} />
                                            <input
                                                type="date"
                                                min={minDate}
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all"
                                            />
                                        </div>

                                        {/* Time slot picker — appears after a date is chosen */}
                                        {formData.date && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Clock size={16} className="text-rose" />
                                                    <span className="text-sm font-bold text-gray-700">Available Time Slots</span>
                                                </div>

                                                {loadingSlots && (
                                                    <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
                                                        <Loader2 className="animate-spin" size={20} />
                                                        <span className="text-sm font-medium">Checking availability…</span>
                                                    </div>
                                                )}

                                                {slotsError && !loadingSlots && (
                                                    <div className="text-sm text-rose bg-rose/5 border border-rose/10 rounded-xl px-4 py-3 text-center font-medium">
                                                        {slotsError}
                                                    </div>
                                                )}

                                                {!loadingSlots && !slotsError && availableSlots.length > 0 && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {availableSlots.map((slot) => (
                                                            <button
                                                                type="button"
                                                                key={slot}
                                                                onClick={() => setFormData({ ...formData, time: slot })}
                                                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${formData.time === slot
                                                                    ? 'bg-rose text-white shadow-lg shadow-rose/20'
                                                                    : 'bg-gray-50 border border-gray-100 text-gray-700 hover:border-rose/30 hover:bg-rose/5'
                                                                    }`}
                                                            >
                                                                {formatTime(slot)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 text-gray-300" size={20} />
                                            <textarea
                                                placeholder="Notes or Vision (optional)"
                                                rows={3}
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-4 focus:bg-white focus:ring-2 focus:ring-rose/20 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button onClick={handleBack} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Back</button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!formData.name || !formData.email || !formData.date || !formData.time}
                                            className="flex-[2] bg-gray-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3 — Confirmation & Payment */}
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                     <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">Secure Booking</h2>
                                    <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 font-medium">Finalize with a refundable deposit.</p>

                                    <div className="bg-ivory rounded-2xl p-6 border border-peach/20 mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Service</span>
                                            <span className="font-bold text-gray-900">{services.find(s => s.id === formData.service)?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Date</span>
                                            <span className="font-bold text-gray-900">{formData.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Time</span>
                                            <span className="font-bold text-gray-900">{formData.time ? formatTime(formData.time) : '—'}</span>
                                        </div>
                                        <div className="h-px bg-peach/20 my-4" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Deposit Amount</span>
                                            <span className="text-2xl font-bold text-rose">{services.find(s => s.id === formData.service)?.deposit}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span>Secure encrypted payment. The deposit is deducted from your total bill.</span>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={handleBack} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Back</button>
                                        <button
                                            onClick={handlePayment}
                                            disabled={isSubmitting}
                                            className="flex-[2] bg-gradient-to-r from-rose to-peach text-white py-4 rounded-xl font-bold shadow-xl shadow-rose/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <CreditCard size={20} />
                                            )}
                                            {isSubmitting ? 'Processing...' : 'Pay & Confirm'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4 — Success */}
                            {bookingStatus === 'success' && (
                                 <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6 md:py-12"
                                >
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <Check size={40} strokeWidth={3} />
                                    </div>
                                    <h2 className="font-serif text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                                    <p className="text-gray-500 mb-4 leading-relaxed">
                                        Your appointment on <span className="font-bold text-gray-900">{formData.date}</span> at <span className="font-bold text-gray-900">{formData.time ? formatTime(formData.time) : ''}</span> is confirmed.
                                    </p>
                                    <p className="text-gray-500 mb-10 leading-relaxed">
                                        Confirmation emails have been sent to <span className="font-bold text-gray-900">{formData.email}</span> and the event has been added to the studio calendar.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="bg-charcoal text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
