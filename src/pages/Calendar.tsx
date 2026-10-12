import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Users,
  X,
} from "lucide-react"

import DashboardLayout from "../components/dashboard/DashboardLayout"
import { useLanguage } from "../context/LanguageContext"

type ViewMode = "day" | "week" | "month"
type Accent = "purple" | "pink" | "orange" | "blue" | "green"

interface CalendarEvent {
  id: number
  title: string
  organization: string
  time: string
  address: string
  address2: string
  badge: string
  date: string
  endDate?: string
  accent: Accent
  image: string
  avatars: string[]
}

interface FormState {
  name: string
  time: string
  date: string
  address: string
  contact: string
  image: string
}

const images = {
  design: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80",
  festival: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=80",
  glastonbury: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&auto=format&fit=crop&q=80",
  ultra: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&auto=format&fit=crop&q=80",
  tech: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&auto=format&fit=crop&q=80",
  workshop: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=700&auto=format&fit=crop&q=80",
  a1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  a2: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  a3: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  a4: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
}

const copy = {
  en: {
    calendar: "Calendar", add: "Add New Event", going: "Upcoming Events", more: "See More", less: "See Less",
    today: "Today", day: "Day", week: "Week", month: "Month", addTitle: "Add New Event", back: "Back",
    upload: "Upload Cover Photo", event: "Event Name", eventPh: "Enter event name", time: "Time", timePh: "12:34 PM",
    date: "Date", datePh: "11-09-2019", address: "Address", addressPh: "Address", contact: "Contact Number",
    contactPh: "Enter your contact number", addNow: "Add Now", required: "Please enter the event name, time, date and address.",
    monday: "MON", tuesday: "TUE", wednesday: "WED", thursday: "THU", friday: "FRI", saturday: "SAT", sunday: "SUN",
    noEvents: "No events", details: "Event details", attendees: "attendees", close: "Close",
  },
  fr: {
    calendar: "Calendrier", add: "Ajouter un événement", going: "Événements à venir", more: "Voir plus", less: "Voir moins",
    today: "Aujourd’hui", day: "Jour", week: "Semaine", month: "Mois", addTitle: "Ajouter un nouvel événement", back: "Retour",
    upload: "Télécharger une photo", event: "Nom de l’événement", eventPh: "Nom de l’événement", time: "Heure", timePh: "12:34",
    date: "Date", datePh: "11-09-2019", address: "Adresse", addressPh: "Adresse", contact: "Numéro de contact",
    contactPh: "Votre numéro", addNow: "Ajouter", required: "Veuillez saisir le nom, l’heure, la date et l’adresse.",
    monday: "LUN", tuesday: "MAR", wednesday: "MER", thursday: "JEU", friday: "VEN", saturday: "SAM", sunday: "DIM",
    noEvents: "Aucun événement", details: "Détails de l’événement", attendees: "participants", close: "Fermer",
  },
  es: {
    calendar: "Calendario", add: "Añadir evento", going: "Próximos eventos", more: "Ver más", less: "Ver menos",
    today: "Hoy", day: "Día", week: "Semana", month: "Mes", addTitle: "Añadir nuevo evento", back: "Volver",
    upload: "Subir foto", event: "Nombre del evento", eventPh: "Nombre del evento", time: "Hora", timePh: "12:34 PM",
    date: "Fecha", datePh: "11-09-2019", address: "Dirección", addressPh: "Dirección", contact: "Número de contacto",
    contactPh: "Tu número", addNow: "Añadir", required: "Introduce el nombre, la hora, la fecha y la dirección.",
    monday: "LUN", tuesday: "MAR", wednesday: "MIÉ", thursday: "JUE", friday: "VIE", saturday: "SÁB", sunday: "DOM",
    noEvents: "Sin eventos", details: "Detalles del evento", attendees: "asistentes", close: "Cerrar",
  },
} as const

const initialEvents: CalendarEvent[] = [
  { id: 1, title: "Design Conference", organization: "Zillul Design Agency", time: "Today · 07:19 AM", address: "56 Davion Mission Suite 157", address2: "Meaghanberg", badge: "15+", date: "2019-10-03", accent: "purple", image: images.design, avatars: [images.a1, images.a2, images.a3] },
  { id: 2, title: "Weekend Festival", organization: "Nordic Live Events", time: "16 October 2019 · 5:00 PM", address: "853 Moore Flats Suite 158", address2: "Sweden", badge: "20+", date: "2019-10-16", accent: "pink", image: images.festival, avatars: [images.a2, images.a3, images.a4] },
  { id: 3, title: "Glastonbury Festival", organization: "UK Music Group", time: "20–22 October 2019 · 8:00 PM", address: "646 Walter Road Apt. 571", address2: "Turks and Caicos Islands", badge: "14+", date: "2019-10-20", endDate: "2019-10-22", accent: "orange", image: images.glastonbury, avatars: [images.a1, images.a4, images.a2] },
  { id: 4, title: "Ultra Europe 2019", organization: "Ultra Worldwide", time: "25 October 2019 · 10:00 PM", address: "506 Satterfield Tunnel Apt. 963", address2: "San Marino", badge: "42+", date: "2019-10-25", accent: "blue", image: images.ultra, avatars: [images.a3, images.a2, images.a4] },
  { id: 5, title: "Product Design Workshop", organization: "Creative Studio", time: "07 November 2019 · 10:00 AM", address: "21 Market Street Suite 400", address2: "London", badge: "12+", date: "2019-11-07", accent: "green", image: images.workshop, avatars: [images.a1, images.a3, images.a4] },
  { id: 6, title: "Tech Innovation Summit", organization: "Future Labs", time: "12 November 2019 · 2:00 PM", address: "88 Innovation Avenue", address2: "Berlin", badge: "30+", date: "2019-11-12", accent: "purple", image: images.tech, avatars: [images.a2, images.a4, images.a1] },
  { id: 7, title: "Winter Music Night", organization: "Live Nation Events", time: "05 December 2019 · 7:30 PM", address: "17 River Road", address2: "Manchester", badge: "25+", date: "2019-12-05", accent: "pink", image: images.festival, avatars: [images.a4, images.a2, images.a3] },
]

const accentStyles: Record<Accent, { border: string; light: string; text: string }> = {
  purple: { border: "#7551FF", light: "rgba(117,81,255,.10)", text: "#6745E5" },
  pink: { border: "#EE5D99", light: "rgba(238,93,153,.10)", text: "#D94683" },
  orange: { border: "#FF9F43", light: "rgba(255,159,67,.12)", text: "#D97706" },
  blue: { border: "#4880FF", light: "rgba(72,128,255,.10)", text: "#3269E8" },
  green: { border: "#00B69B", light: "rgba(0,182,155,.10)", text: "#008F7A" },
}

const monthNames = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
} as const

const weekDayNames = {
  en: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  fr: ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"],
  es: ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"],
} as const

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}
function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}
function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()) }
function addDays(date: Date, amount: number) { const next = new Date(date); next.setDate(next.getDate() + amount); return startOfDay(next) }
function mondayIndex(date: Date) { return (date.getDay() + 6) % 7 }
function formatDateKey(date: Date) { return toDateKey(date.getFullYear(), date.getMonth(), date.getDate()) }
function isEventOnDate(event: CalendarEvent, dateKey: string) { return event.date <= dateKey && (event.endDate ?? event.date) >= dateKey }
function getEventHour(event: CalendarEvent) {
  const match = event.time.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/)
  if (!match) return 9
  let hour = Number(match[1])
  if (match[3] === "pm" && hour !== 12) hour += 12
  if (match[3] === "am" && hour === 12) hour = 0
  return hour
}
function formatHour(hour: number) { const suffix = hour >= 12 ? "PM" : "AM"; return `${hour % 12 || 12}:00 ${suffix}` }
function localeFor(lang: keyof typeof copy) { return lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US" }
function formatLongDate(date: Date, lang: keyof typeof copy) { return new Intl.DateTimeFormat(localeFor(lang), { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date) }

function EventDetails({ event, t, onClose }: { event: CalendarEvent; t: (typeof copy)[keyof typeof copy]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className="w-full max-w-[470px] overflow-hidden rounded-t-[24px] bg-white shadow-2xl dark:bg-[#273142] sm:rounded-[22px]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="relative h-[190px] sm:h-[220px]">
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-[#202224] shadow-sm hover:bg-white" aria-label={t.close}><X size={18} /></button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="mb-2 inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">{event.organization}</span>
            <h2 className="text-[22px] font-bold leading-tight">{event.title}</h2>
          </div>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex gap-3"><Clock3 size={18} className="mt-0.5 shrink-0 text-[#4880FF]" /><div><p className="text-[12px] font-semibold text-[#9AA1AD]">Date & time</p><p className="text-[14px] font-semibold text-[#202224] dark:text-white">{event.time}</p></div></div>
          <div className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-[#4880FF]" /><div><p className="text-[12px] font-semibold text-[#9AA1AD]">Location</p><p className="text-[14px] font-semibold text-[#202224] dark:text-white">{event.address}</p><p className="text-[13px] text-[#777] dark:text-gray-400">{event.address2}</p></div></div>
          <div className="flex items-center gap-3"><Users size={18} className="text-[#4880FF]" /><div><p className="text-[12px] font-semibold text-[#9AA1AD]">{event.badge} {t.attendees}</p><div className="mt-1 flex -space-x-2">{event.avatars.map((avatar) => <img key={avatar} src={avatar} alt="" className="h-7 w-7 rounded-full border-2 border-white object-cover dark:border-[#273142]" />)}</div></div></div>
        </div>
      </div>
    </div>
  )
}

function MonthView({ year, month, events, selectedId, onSelect, lang }: { year: number; month: number; events: CalendarEvent[]; selectedId: number | null; onSelect: (event: CalendarEvent) => void; lang: keyof typeof copy }) {
  const firstDay = new Date(year, month, 1)
  const gridStart = addDays(firstDay, -mondayIndex(firstDay))
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  const todayKey = formatDateKey(new Date(2019, 9, 3))
  const [pickedKey, setPickedKey] = useState<string | null>(null)
  const activeKey = pickedKey ?? (days.some((d) => formatDateKey(d) === todayKey) ? todayKey : formatDateKey(firstDay))
  const agenda = events.filter((event) => isEventOnDate(event, activeKey))

  return (
    <>
      {/* ---------- Phone: compact grid + agenda ---------- */}
      <div className="sm:hidden">
        <div className="overflow-hidden rounded-[16px] border border-[#E7EAF0] dark:border-[#344052]">
          <div className="grid grid-cols-7 bg-[#F8FAFC] dark:bg-[#222C3A]">
            {weekDayNames[lang].map((day, index) => <div key={day} className={`py-2.5 text-center text-[9px] font-bold tracking-[.08em] ${index > 4 ? "text-[#4880FF]" : "text-[#7C8491]"}`}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 p-1.5">
            {days.map((date) => {
              const dateKey = formatDateKey(date)
              const outside = date.getMonth() !== month
              const dayEvents = events.filter((event) => isEventOnDate(event, dateKey))
              const isToday = dateKey === todayKey
              const isActive = dateKey === activeKey
              return (
                <button key={dateKey} type="button" onClick={() => setPickedKey(dateKey)} className={`flex h-[46px] flex-col items-center justify-center gap-1 rounded-xl transition ${isActive ? "bg-[#4880FF] text-white shadow-[0_6px_16px_rgba(72,128,255,.3)]" : isToday ? "bg-[#4880FF]/10 text-[#4880FF]" : outside ? "text-[#C2C8D1] dark:text-[#5B6678]" : "text-[#343A46] hover:bg-[#F1F5FA] dark:text-white dark:hover:bg-[#323D4E]"}`}>
                  <span className="text-[13px] font-bold leading-none">{date.getDate()}</span>
                  <span className="flex h-1.5 items-center gap-0.5">
                    {dayEvents.slice(0, 3).map((event) => <i key={event.id} className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? "#fff" : accentStyles[event.accent].border }} />)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-bold text-[#8C939F]">{formatLongDate(parseDateKey(activeKey), lang)}</p>
          {agenda.length === 0 ? <div className="rounded-xl border border-dashed border-[#DCE2EA] py-6 text-center text-[12px] font-semibold text-[#9AA1AD] dark:border-[#455164]">{copy[lang].noEvents}</div> : <div className="space-y-2">
            {agenda.map((event) => { const c = accentStyles[event.accent]; return <button key={event.id} type="button" onClick={() => onSelect(event)} className="flex w-full items-center gap-3 rounded-xl border-l-4 p-3 text-left" style={{ borderLeftColor: c.border, background: c.light }}><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold" style={{ color: c.text }}>{event.title}</p><p className="mt-0.5 truncate text-[11px] text-[#7C8491] dark:text-gray-400">{event.time}</p></div><ChevronRight size={16} className="shrink-0 text-[#A4AAB4]" /></button> })}
          </div>}
        </div>
      </div>

      {/* ---------- Tablet / desktop: full grid ---------- */}
      <div className="hidden overflow-x-auto rounded-[16px] border border-[#E7EAF0] dark:border-[#344052] sm:block">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-[#E7EAF0] bg-[#F8FAFC] dark:border-[#344052] dark:bg-[#222C3A]">
            {weekDayNames[lang].map((day, index) => <div key={day} className={`px-2 py-3 text-center text-[10px] font-bold tracking-[.12em] ${index > 4 ? "text-[#4880FF]" : "text-[#7C8491]"}`}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dateKey = formatDateKey(date)
              const outside = date.getMonth() !== month
              const weekend = index % 7 > 4
              const dayEvents = events.filter((event) => isEventOnDate(event, dateKey))
              const isToday = dateKey === todayKey
              return (
                <div key={dateKey} className={`group min-h-[118px] border-b border-r border-[#E7EAF0] p-2 transition-colors hover:bg-[#F3F7FF] dark:border-[#344052] dark:hover:bg-[#2B3648] ${(index + 1) % 7 === 0 ? "border-r-0" : ""} ${isToday ? "bg-[#4880FF]/[0.04]" : outside ? "bg-[#FAFBFC] dark:bg-[#202936]" : weekend ? "bg-[#FBFCFE] dark:bg-[#252F3F]" : "bg-white dark:bg-[#273142]"}`}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${isToday ? "bg-[#4880FF] text-white shadow-[0_5px_15px_rgba(72,128,255,.35)]" : outside ? "text-[#B7BDC7] dark:text-[#5B6678]" : "text-[#343A46] dark:text-white"}`}>{date.getDate()}</span>
                    {dayEvents.length > 1 && <span className="rounded-full bg-[#4880FF]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#4880FF]">{dayEvents.length}</span>}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const c = accentStyles[event.accent]
                      return <button key={`${event.id}-${dateKey}`} type="button" onClick={() => onSelect(event)} className={`flex w-full items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-left text-[10.5px] font-bold transition-all hover:-translate-y-px hover:shadow-md ${selectedId === event.id ? "ring-2 ring-[#4880FF]/40" : ""}`} style={{ background: c.light, color: c.text }} title={`${event.title} · ${event.time}`}><i className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c.border }} /><span className="truncate">{event.title}</span></button>
                    })}
                    {dayEvents.length > 2 && <button type="button" onClick={() => onSelect(dayEvents[2])} className="pl-1 text-[10px] font-bold text-[#4880FF] hover:underline">+{dayEvents.length - 2} more</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function WeekView({ weekStart, events, selectedId, onSelect, lang }: { weekStart: Date; events: CalendarEvent[]; selectedId: number | null; onSelect: (event: CalendarEvent) => void; lang: keyof typeof copy }) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const hours = Array.from({ length: 15 }, (_, index) => index + 7)
  return (
    <div className="overflow-x-auto rounded-[16px] border border-[#E7EAF0] dark:border-[#344052]">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[62px_repeat(7,minmax(100px,1fr))] border-b border-[#E7EAF0] bg-[#F8FAFC] dark:border-[#344052] dark:bg-[#222C3A]">
          <div />
          {days.map((date, index) => <div key={formatDateKey(date)} className="border-l border-[#E7EAF0] px-2 py-3 text-center dark:border-[#344052]"><p className="text-[9px] font-bold tracking-wider text-[#8A919D]">{weekDayNames[lang][index]}</p><p className="mt-1 text-[15px] font-bold text-[#303744] dark:text-white">{date.getDate()}</p></div>)}
        </div>
        {hours.map((hour) => <div key={hour} className="grid min-h-[68px] grid-cols-[62px_repeat(7,minmax(100px,1fr))] border-b border-[#E7EAF0] last:border-b-0 dark:border-[#344052]"><div className="px-2 py-2 text-right text-[10px] font-semibold text-[#9AA1AD]">{formatHour(hour)}</div>{days.map((date) => { const key = formatDateKey(date); const matches = events.filter((event) => isEventOnDate(event, key) && getEventHour(event) === hour); return <div key={key} className="border-l border-[#E7EAF0] p-1.5 dark:border-[#344052]">{matches.map((event) => { const c = accentStyles[event.accent]; return <button key={event.id} type="button" onClick={() => onSelect(event)} className={`w-full truncate rounded-md border-l-[3px] px-2 py-2 text-left text-[10px] font-bold ${selectedId === event.id ? "ring-2 ring-[#4880FF]/20" : ""}`} style={{ borderLeftColor: c.border, background: c.light, color: c.text }}>{event.title}</button> })}</div> })}</div>)}
      </div>
    </div>
  )
}

function DayView({ date, events, selectedId, onSelect }: { date: Date; events: CalendarEvent[]; selectedId: number | null; onSelect: (event: CalendarEvent) => void }) {
  const hours = Array.from({ length: 15 }, (_, index) => index + 7)
  const dayEvents = events.filter((event) => isEventOnDate(event, formatDateKey(date)))
  return <div className="overflow-hidden rounded-[16px] border border-[#E7EAF0] dark:border-[#344052]">{hours.map((hour) => { const matches = dayEvents.filter((event) => getEventHour(event) === hour); return <div key={hour} className="grid min-h-[78px] grid-cols-[76px_1fr] border-b border-[#E7EAF0] last:border-b-0 dark:border-[#344052]"><div className="border-r border-[#E7EAF0] px-3 py-3 text-right text-[10px] font-semibold text-[#9AA1AD] dark:border-[#344052]">{formatHour(hour)}</div><div className="space-y-2 p-2">{matches.map((event) => { const c = accentStyles[event.accent]; return <button key={event.id} type="button" onClick={() => onSelect(event)} className={`block w-full rounded-lg border-l-4 px-3 py-2 text-left text-[11px] font-bold ${selectedId === event.id ? "ring-2 ring-[#4880FF]/20" : ""}`} style={{ borderLeftColor: c.border, background: c.light, color: c.text }}>{event.title}</button> })}</div></div> })}</div>
}

function EventFeed({ events, expanded, setExpanded, onAdd, onSelect, t }: { events: CalendarEvent[]; expanded: boolean; setExpanded: () => void; onAdd: () => void; onSelect: (event: CalendarEvent) => void; t: (typeof copy)[keyof typeof copy] }) {
  const visible = expanded ? events : events.slice(0, 4)
  return <aside className="w-full shrink-0 rounded-[18px] border border-[#E7EAF0] bg-white p-4 shadow-[0_8px_30px_rgba(32,34,36,.04)] dark:border-[#344052] dark:bg-[#273142] sm:p-5 lg:w-[290px] xl:w-[310px]">
    <button type="button" onClick={onAdd} className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4880FF] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(72,128,255,.2)] transition hover:bg-[#3B6EE8] active:scale-[.99]"><Plus size={17} />{t.add}</button>
    <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#9AA1AD]">Schedule</p><h2 className="mt-1 text-[18px] font-bold text-[#202224] dark:text-white">{t.going}</h2></div><div className="rounded-lg bg-[#4880FF]/10 p-2 text-[#4880FF]"><CalendarDays size={17} /></div></div>
    <div className="space-y-2">
      {visible.map((event) => { const c = accentStyles[event.accent]; const d = parseDateKey(event.date); return <button key={event.id} type="button" onClick={() => onSelect(event)} className="group flex w-full items-center gap-3 rounded-xl border border-[#EEF1F6] p-2.5 text-left transition hover:-translate-y-px hover:border-[#4880FF]/40 hover:shadow-md dark:border-[#344052] dark:hover:bg-[#222C3A]"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: c.light, color: c.text }}><span className="text-[17px] font-extrabold leading-none">{d.getDate()}</span><span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">{new Intl.DateTimeFormat("en-US", { month: "short" }).format(d)}</span></div><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold text-[#202224] dark:text-white">{event.title}</p><p className="mt-0.5 truncate text-[11px] text-[#8B929D]">{event.time}</p></div><ChevronRight size={15} className="shrink-0 text-[#A4AAB4] transition group-hover:translate-x-0.5 group-hover:text-[#4880FF]" /></button> })}
    </div>
    {events.length > 4 && <button type="button" onClick={setExpanded} className="mt-4 w-full rounded-lg py-2 text-[12px] font-bold text-[#4880FF] hover:bg-[#4880FF]/5">{expanded ? t.less : t.more}</button>}
  </aside>
}

function AddEventForm({ onBack, onAdd, t }: { onBack: () => void; onAdd: (event: CalendarEvent) => void; t: (typeof copy)[keyof typeof copy] }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>({ name: "", time: "", date: "", address: "", contact: "", image: "" })
  const [error, setError] = useState("")
  const update = (key: keyof FormState, value: string) => { setForm((previous) => ({ ...previous, [key]: value })); setError("") }
  const upload = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((previous) => ({ ...previous, image: String(reader.result) })); reader.readAsDataURL(file) }
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!form.name.trim() || !form.time.trim() || !form.date || !form.address.trim()) { setError(t.required); return }; const selected = parseDateKey(form.date); onAdd({ id: Date.now(), title: form.name.trim(), organization: "DashStack Events", time: form.time.trim(), address: form.address.trim(), address2: form.contact.trim() || "Online event", badge: "1+", date: formatDateKey(selected), accent: "blue", image: form.image || images.design, avatars: [images.a1, images.a2, images.a3] }) }
  const fields = [
    { key: "name" as const, label: t.event, ph: t.eventPh, type: "text" }, { key: "time" as const, label: t.time, ph: t.timePh, type: "text" },
    { key: "date" as const, label: t.date, ph: t.datePh, type: "date" }, { key: "address" as const, label: t.address, ph: t.addressPh, type: "text" },
    { key: "contact" as const, label: t.contact, ph: t.contactPh, type: "text" },
  ]
  return <div><button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4880FF]"><ArrowLeft size={16} />{t.back}</button><div className="rounded-[18px] border border-[#E7EAF0] bg-white p-5 shadow-sm dark:border-[#344052] dark:bg-[#273142] sm:p-8 md:p-12"><form onSubmit={submit}><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} /><button type="button" onClick={() => fileRef.current?.click()} className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#EEF2F8] dark:bg-[#323D4E]">{form.image ? <img src={form.image} alt="" className="h-full w-full object-cover" /> : <Camera size={27} className="text-[#6D7582]" />}</button><button type="button" onClick={() => fileRef.current?.click()} className="mx-auto mb-9 block text-sm font-bold text-[#4880FF]">{t.upload}</button><div className="mx-auto grid max-w-[780px] grid-cols-1 gap-5 md:grid-cols-2">{fields.map((field) => <label key={field.key} className="block"><span className="mb-2 block text-[13px] font-semibold text-[#606874] dark:text-gray-300">{field.label}</span><input type={field.type} value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} placeholder={field.ph} className="h-12 w-full rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] px-4 text-sm text-[#202224] outline-none transition focus:border-[#4880FF] focus:ring-4 focus:ring-[#4880FF]/10 dark:border-[#4B5668] dark:bg-[#323D4E] dark:text-white" /></label>)}</div>{error && <p className="mt-5 text-center text-sm font-semibold text-[#F93C65]">{error}</p>}<button type="submit" className="mx-auto mt-8 block h-12 w-full max-w-[280px] rounded-xl bg-[#4880FF] text-sm font-bold text-white shadow-[0_8px_20px_rgba(72,128,255,.2)]">{t.addNow}</button></form></div></div>
}

export default function Calendar() {
  const { language } = useLanguage()
  const lang: keyof typeof copy = String(language).toLowerCase().startsWith("fr") ? "fr" : String(language).toLowerCase().startsWith("es") ? "es" : "en"
  const t = copy[lang]
  const [adding, setAdding] = useState(false)
  const [view, setView] = useState<ViewMode>("month")
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<CalendarEvent | null>(null)
  const [focusedDate, setFocusedDate] = useState(new Date(2019, 9, 1))
  const focusedYear = focusedDate.getFullYear()
  const focusedMonth = focusedDate.getMonth()
  const weekStart = addDays(focusedDate, -mondayIndex(focusedDate))
  const displayedTitle = useMemo(() => {
    if (view === "day") return formatLongDate(focusedDate, lang)
    if (view === "week") {
      const weekEnd = addDays(weekStart, 6)
      const fmt = new Intl.DateTimeFormat(localeFor(lang), { month: "short", day: "numeric" })
      const fmtEnd = new Intl.DateTimeFormat(localeFor(lang), { month: "short", day: "numeric", year: "numeric" })
      return `${fmt.format(weekStart)} – ${fmtEnd.format(weekEnd)}`
    }
    return `${monthNames[lang][focusedMonth]} ${focusedYear}`
  }, [view, focusedDate, weekStart, lang, focusedMonth, focusedYear])
  const navigate = (amount: number) => { setSelected(null); if (view === "day") setFocusedDate(addDays(focusedDate, amount)); else if (view === "week") setFocusedDate(addDays(focusedDate, amount * 7)); else setFocusedDate(new Date(focusedYear, focusedMonth + amount, 1)) }
  const handleToday = () => { setSelected(null); setFocusedDate(new Date(2019, 9, 3)) }
  const selectEvent = (event: CalendarEvent) => { setSelected(event); setFocusedDate(parseDateKey(event.date)) }
  const addEvent = (event: CalendarEvent) => { setEvents((previous) => [...previous, event]); setFocusedDate(parseDateKey(event.date)); setSelected(null); setAdding(false); setView("month") }

  return <DashboardLayout>
    <div className="w-full pb-6">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-[11px] font-bold uppercase tracking-[.14em] text-[#4880FF]">DashStack</p><h1 className="font-sans text-[26px] font-bold leading-none tracking-[-.4px] text-[#202224] dark:text-white sm:text-[32px]">{adding ? t.addTitle : t.calendar}</h1><p className="mt-2 text-[13px] text-[#8C939F]">Plan, manage and track your events in one place.</p></div>{!adding && <button type="button" onClick={() => setAdding(true)} className="hidden h-10 items-center gap-2 rounded-xl bg-[#4880FF] px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(72,128,255,.18)] sm:flex"><Plus size={16} />{t.add}</button>}</div>
      {adding ? <AddEventForm onBack={() => setAdding(false)} onAdd={addEvent} t={t} /> : <div className="flex flex-col gap-5 xl:flex-row">
        <EventFeed events={events} expanded={expanded} setExpanded={() => setExpanded((previous) => !previous)} onAdd={() => setAdding(true)} onSelect={selectEvent} t={t} />
        <section className="min-w-0 flex-1 rounded-[20px] border border-[#E7EAF0] bg-white p-3 shadow-[0_8px_30px_rgba(32,34,36,.04)] dark:border-[#344052] dark:bg-[#273142] sm:p-5">
          <div className="mb-4 rounded-[16px] border border-[#E7EAF0] bg-[#F8FAFC] p-3 dark:border-[#344052] dark:bg-[#222C3A] sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <button type="button" onClick={handleToday} className="order-2 h-9 rounded-lg border border-[#DCE2EA] bg-white px-3 text-[12px] font-bold text-[#4D5561] hover:border-[#4880FF] hover:text-[#4880FF] dark:border-[#455164] dark:bg-[#273142] dark:text-white lg:order-1">{t.today}</button>
              <div className="order-1 flex items-center justify-center gap-2 lg:order-2"><button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 text-[#606874] hover:bg-[#4880FF]/10 hover:text-[#4880FF] dark:text-gray-300" aria-label="Previous period"><ChevronLeft size={19} /></button><div className="min-w-0 text-center"><p className="text-[18px] font-bold text-[#202224] dark:text-white sm:text-[21px]">{displayedTitle}</p>{view === "month" && <p className="mt-0.5 text-[11px] font-semibold text-[#8C939F]">{events.filter((e) => e.date.startsWith(`${focusedYear}-${String(focusedMonth + 1).padStart(2, "0")}`)).length} events this month</p>}</div><button type="button" onClick={() => navigate(1)} className="rounded-full p-2 text-[#606874] hover:bg-[#4880FF]/10 hover:text-[#4880FF] dark:text-gray-300" aria-label="Next period"><ChevronRight size={19} /></button></div>
              <div className="order-3 flex w-full rounded-xl border border-[#DCE2EA] bg-white p-1 dark:border-[#455164] dark:bg-[#273142] lg:w-auto">{([ ["day", t.day], ["week", t.week], ["month", t.month] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => { setSelected(null); setView(value) }} className={`h-8 flex-1 rounded-lg px-4 text-[11px] font-bold transition sm:flex-none ${view === value ? "bg-[#4880FF] text-white shadow-sm" : "text-[#68717E] hover:bg-[#F1F5FA] dark:text-gray-300 dark:hover:bg-[#323D4E]"}`}>{label}</button>)}</div>
            </div>
          </div>
          {view === "month" && <MonthView key={`${focusedYear}-${focusedMonth}`} year={focusedYear} month={focusedMonth} events={events} selectedId={selected?.id ?? null} onSelect={selectEvent} lang={lang} />}
          {view === "week" && <WeekView weekStart={weekStart} events={events} selectedId={selected?.id ?? null} onSelect={selectEvent} lang={lang} />}
          {view === "day" && <DayView date={focusedDate} events={events} selectedId={selected?.id ?? null} onSelect={selectEvent} />}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-semibold text-[#8C939F] sm:justify-start"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#7551FF]" />Design</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#EE5D99]" />Festival</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#FF9F43]" />Music</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#00B69B]" />Workshop</span></div>
        </section>
      </div>}
      {!adding && <button type="button" onClick={() => setAdding(true)} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4880FF] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(72,128,255,.18)] sm:hidden"><Plus size={17} />{t.add}</button>}
    </div>
    {selected && <EventDetails event={selected} t={t} onClose={() => setSelected(null)} />}
  </DashboardLayout>
}
