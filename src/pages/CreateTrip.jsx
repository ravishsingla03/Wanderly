import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { createTrip } from '../lib/queries'
import { supabase } from '../lib/supabase'
import { PRESET_GRADIENTS } from '../lib/seedData'
import useAuthStore from '../store/authStore'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS = ['2024','2025','2026']
const TRIP_TYPES = ['solo','couple','family','group']
const STAY_TYPES = ['Hostel','Guesthouse','Hotel','Heritage Hotel','Homestay','Houseboat','Resort','Camping','Airbnb']

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1,2,3,4].map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
              s < step ? 'bg-[#1D9E75] text-white'
              : s === step ? 'border-2 border-[#1D9E75] text-[#1D9E75]'
              : 'border border-white/20 text-white/30'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {s < 4 && (
            <div className={`flex-1 h-0.5 ${s < step ? 'bg-[#1D9E75]' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={s <= value ? '#1D9E75' : 'rgba(255,255,255,0.15)'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!value.includes(input.trim())) onChange([...value, input.trim()])
      setInput('')
    }
  }
  return (
    <div className="rounded-lg border border-white/10 p-2 flex flex-wrap gap-1.5 min-h-[44px] focus-within:border-[#1D9E75]"
      style={{ background: '#1a1a1a' }}>
      {value.map((tag) => (
        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#1D9E75]/15 text-[#1D9E75] flex items-center gap-1">
          {tag}
          <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="text-[#1D9E75]/60 hover:text-[#1D9E75] cursor-pointer">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-20 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
      />
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-[#1D9E75] focus:outline-none transition-colors'
const inputStyle = { background: '#1a1a1a' }

export default function CreateTrip({ onAuthOpen }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState([])
  const [placesToVisit, setPlacesToVisit] = useState([])
  const [bestMonths, setBestMonths] = useState([])
  const [itinerary, setItinerary] = useState([{ title: '', description: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [gradientIdx, setGradientIdx] = useState(0)

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm()

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-4 px-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <p className="text-white/60 text-center">You need to be signed in to write a trip journal.</p>
        <button onClick={() => onAuthOpen?.('signup')} className="bg-[#1D9E75] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#17856A] transition-colors cursor-pointer">
          Sign in to continue
        </button>
      </div>
    )
  }

  const nextStep = async () => {
    const fields = {
      1: ['destination', 'trip_type'],
      2: [],
      3: [],
    }
    const valid = await trigger(fields[step] || [])
    if (valid) setStep((s) => Math.min(s + 1, 4))
  }

  const addDay = () => setItinerary([...itinerary, { title: '', description: '' }])
  const updateDay = (i, field, val) => {
    const updated = [...itinerary]
    updated[i][field] = val
    setItinerary(updated)
  }

  const onSubmit = async (data) => {
    if (rating === 0) { alert('Please select a rating.'); return }
    setSubmitting(true)

    const month = data.month || ''
    const year = data.year || ''

    const tripPayload = {
      user_id: user.id,
      destination: data.destination,
      state_country: data.state_country || null,
      duration_days: data.duration_days ? parseInt(data.duration_days) : null,
      trip_type: data.trip_type,
      month_year: `${month} ${year}`.trim() || null,
      total_budget: data.total_budget ? parseInt(data.total_budget) : null,
      budget_breakdown: {
        transport: data.budget_transport ? parseInt(data.budget_transport) : 0,
        stay: data.budget_stay ? parseInt(data.budget_stay) : 0,
        food: data.budget_food ? parseInt(data.budget_food) : 0,
        activities: data.budget_activities ? parseInt(data.budget_activities) : 0,
        misc: data.budget_misc ? parseInt(data.budget_misc) : 0,
      },
      stay_type: data.stay_type || null,
      stay_cost_per_night: data.stay_cost_per_night ? parseInt(data.stay_cost_per_night) : null,
      weather_min: data.weather_min ? parseInt(data.weather_min) : null,
      weather_max: data.weather_max ? parseInt(data.weather_max) : null,
      best_months: bestMonths,
      itinerary: itinerary.filter(d => d.title || d.description),
      places_to_visit: placesToVisit,
      tags,
      overall_rating: rating,
      experience_summary: data.experience_summary || null,
      tips: data.tips || null,
      cover_gradient: PRESET_GRADIENTS[gradientIdx],
    }

    try {
      const newTrip = await createTrip(tripPayload)
      try { await supabase.rpc('increment_trips_count', { user_id: user.id }) } catch (_) {}
      navigate(`/trip/${newTrip.id}`)
    } catch (e) {
      alert('Failed to submit: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl text-white mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Write a trip journal
          </h1>
          <p className="text-white/40 text-sm">Help other travelers plan smarter</p>
        </div>

        <ProgressBar step={step} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-semibold text-white/80">Step 1 — Basics</h2>
                <Field label="Destination *" error={errors.destination?.message}>
                  <input {...register('destination', { required: 'Required' })} placeholder="e.g. Manali, Himachal Pradesh" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="State / Country">
                  <input {...register('state_country')} placeholder="e.g. India" className={inputCls} style={inputStyle} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Duration (days)">
                    <input type="number" {...register('duration_days')} placeholder="7" min="1" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Trip Type *" error={errors.trip_type?.message}>
                    <select {...register('trip_type', { required: 'Required' })} className={inputCls} style={inputStyle}>
                      <option value="">Select</option>
                      {TRIP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Month">
                    <select {...register('month')} className={inputCls} style={inputStyle}>
                      <option value="">Select</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Year">
                    <select {...register('year')} className={inputCls} style={inputStyle}>
                      <option value="">Select</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Card Color">
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_GRADIENTS.map((g, i) => (
                      <button key={i} type="button" onClick={() => setGradientIdx(i)}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${gradientIdx === i ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ background: g.replace('linear-gradient(160deg, ', '').split(' 0%')[0] }}
                      />
                    ))}
                  </div>
                </Field>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-semibold text-white/80">Step 2 — Budget</h2>
                <Field label="Total Budget (₹)">
                  <input type="number" {...register('total_budget')} placeholder="12000" className={inputCls} style={inputStyle} />
                </Field>
                <p className="text-xs text-white/40">Breakdown (optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  {['transport','stay','food','activities','misc'].map((cat) => (
                    <Field key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                      <input type="number" {...register(`budget_${cat}`)} placeholder="0" className={inputCls} style={inputStyle} />
                    </Field>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-semibold text-white/80">Step 3 — Itinerary & Places</h2>
                <Field label="Tags (press Enter to add)">
                  <TagInput value={tags} onChange={setTags} placeholder="Mountains, Beach, Heritage…" />
                </Field>
                <Field label="Places to Visit (press Enter to add)">
                  <TagInput value={placesToVisit} onChange={setPlacesToVisit} placeholder="Solang Valley, Old Manali…" />
                </Field>
                <Field label="Best Months to Visit">
                  <div className="flex flex-wrap gap-2">
                    {MONTHS.map((m) => (
                      <button key={m} type="button"
                        onClick={() => setBestMonths(bestMonths.includes(m) ? bestMonths.filter(x => x !== m) : [...bestMonths, m])}
                        className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${bestMonths.includes(m) ? 'bg-[#1D9E75] border-[#1D9E75] text-white' : 'border-white/20 text-white/50 hover:text-white'}`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </Field>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Day-by-Day Itinerary (optional)</label>
                  {itinerary.map((day, i) => (
                    <div key={i} className="mb-3 p-3 rounded-xl border border-white/8 space-y-2" style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-xs text-white/40">Day {i + 1}</p>
                      <input value={day.title} onChange={(e) => updateDay(i, 'title', e.target.value)} placeholder="Day title" className={inputCls} style={inputStyle} />
                      <textarea value={day.description} onChange={(e) => updateDay(i, 'description', e.target.value)} placeholder="What did you do?" rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
                    </div>
                  ))}
                  <button type="button" onClick={addDay} className="text-xs text-[#1D9E75] border border-[#1D9E75]/30 px-3 py-1.5 rounded-lg hover:bg-[#1D9E75]/10 transition-colors cursor-pointer">
                    + Add day
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-semibold text-white/80">Step 4 — Stay, Weather & Tips</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Stay Type">
                    <select {...register('stay_type')} className={inputCls} style={inputStyle}>
                      <option value="">Select</option>
                      {STAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Cost per Night (₹)">
                    <input type="number" {...register('stay_cost_per_night')} placeholder="800" className={inputCls} style={inputStyle} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min Temp (°C)">
                    <input type="number" {...register('weather_min')} placeholder="12" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Max Temp (°C)">
                    <input type="number" {...register('weather_max')} placeholder="25" className={inputCls} style={inputStyle} />
                  </Field>
                </div>
                <Field label="Experience Summary">
                  <textarea {...register('experience_summary')} placeholder="Describe your overall experience…" rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
                </Field>
                <Field label="Tips for Travelers">
                  <textarea {...register('tips')} placeholder="Share useful tips…" rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
                </Field>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Overall Rating</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                ← Back
              </button>
            ) : <div />}
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="bg-[#1D9E75] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#17856A] transition-colors cursor-pointer">
                Continue →
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="bg-[#1D9E75] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#17856A] transition-colors disabled:opacity-60 cursor-pointer">
                {submitting ? 'Publishing…' : 'Publish Journal'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
