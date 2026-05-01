import { motion } from 'framer-motion'
import { nextMondayIST, weekLabel } from '../lib/date'

export default function Header() {
const nextWeek = weekLabel(nextMondayIST())
return (
<header className="flex items-center justify-between py-5">
<motion.h1
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="text-3xl md:text-4xl font-extrabold font-display tracking-tight logo-text"
>
AROGYA KAVACH
</motion.h1>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.2, duration: 0.6 }}
className="px-4 py-2 rounded-full bg-white shadow-soft border border-white/70 text-slate-700"
title="Next week start (IST)"
>
Forecast week: <span className="font-semibold">{nextWeek}</span>
</motion.div>
</header>
)
}