import { useState } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_CONTACT_API_URL;
const EMPTY = { name: '', email: '', message: '', website: '' };

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-platinum placeholder-gray-500 ' +
  'focus:outline-none focus:border-cyan-glow/60 focus:bg-white/10 transition-colors';

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      setForm(EMPTY);
    } catch {
      setStatus('error');
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full mt-10"
    >
      <div className="glass glow-border rounded-2xl p-6 flex flex-col gap-4 text-left">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            name="name"
            value={form.name}
            onChange={update}
            placeholder="Your name"
            required
            maxLength={100}
            autoComplete="name"
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            placeholder="Your email"
            required
            maxLength={200}
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <textarea
          name="message"
          value={form.message}
          onChange={update}
          placeholder="Your message"
          required
          minLength={5}
          maxLength={5000}
          rows={5}
          className={`${inputClass} resize-none`}
        />

        {/* Honeypot: invisible para personas, los bots lo rellenan */}
        <input
          name="website"
          value={form.website}
          onChange={update}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm min-h-[1.25rem]">
            {status === 'sent' && <span className="text-emerald-glow">Message sent. Thanks! I'll get back to you soon.</span>}
            {status === 'error' && <span className="text-red-400">Something went wrong. Please try again or email me directly.</span>}
          </p>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="glass glow-border px-6 py-3 rounded-full text-purple-glow font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === 'sending' ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
