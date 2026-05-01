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

</header>
)
}