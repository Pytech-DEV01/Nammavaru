import { useEffect, useRef, useState } from 'react'

const fields = [
  {
    name: 'name',
    label: 'Full name',
    type: 'text',
    placeholder: 'Your name',
    autoComplete: 'name',
  },
  {
    name: 'email',
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    autoComplete: 'email',
  },
  {
    name: 'phone',
    label: 'Phone number',
    type: 'tel',
    placeholder: '98765 43210',
    autoComplete: 'tel',
    inputMode: 'numeric',
    pattern: '[6-9][0-9]{9}',
    minLength: 10,
    maxLength: 10,
    title: 'Enter a 10-digit Indian mobile number starting with 6–9.',
  },
  {
    name: 'location',
    label: 'City',
    type: 'text',
    placeholder: 'Your city',
    autoComplete: 'address-level2',
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    placeholder: 'Your age',
    min: '1',
    max: '120',
    inputMode: 'numeric',
  },
]

const initialForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  age: '',
}

const whatsappUrl =
  'https://chat.whatsapp.com/F6IxIfgYDJvFY1DwFJoE2l?s=cl&p=a&mlu=4&ilr=4&iam=2'

const communityMoments = [
  {
    image: '/friends/kannada-culture.png',
    alt: 'Illustrated collage celebrating Kannada language, heritage, architecture and folk dance',
    caption: 'Celebrate Kannada culture',
  },
  {
    image: '/friends/mysore-palace.png',
    alt: 'Mysore Palace glowing in the evening light',
    caption: 'Discover Karnataka heritage',
  },
  {
    image: '/friends/gathering.jpg',
    alt: 'Friends sitting together with their arms around each other',
    caption: 'Find your people',
  },
  {
    image: '/friends/conversation.jpg',
    alt: 'Friends sharing a moment together outdoors',
    caption: 'Start a conversation',
  },
  {
    image: '/friends/stories.jpg',
    alt: 'Friends gathered around a table, talking and sharing food',
    caption: 'Share your story',
  },
  {
    image: '/friends/park-gathering.png',
    alt: 'A large group of friends gathered on the grass beside a river',
    caption: 'Meet in the park',
  },
  {
    image: '/friends/park-picnic.png',
    alt: 'Friends enjoying a picnic together in a sunny park',
    caption: 'Make room at the picnic',
  },
  {
    image: '/friends/campus-picnic.png',
    alt: 'A group of friends sharing a meal on a picnic blanket',
    caption: 'Good food, good company',
  },
  {
    image: '/friends/friends-picnic.png',
    alt: 'Friends gathered around snacks on a picnic blanket',
    caption: 'Bring everyone together',
  },
  {
    image: '/friends/friends-on-campus.png',
    alt: 'A group of friends relaxing together on a campus lawn',
    caption: 'Campus memories',
  },
  {
    image: '/friends/friends-together.png',
    alt: 'Friends leaning together and looking up at the sky',
    caption: 'Better together',
  },
]

const eventFlow = [
  {
    title: 'Kannada Culture',
    description:
      'Celebrate our roots, traditions and local flavours.',
    image: '/friends/kannada-culture.png',
    alt: 'Illustrated collage celebrating Kannada language, heritage, architecture and folk dance',
  },
  {
    title: 'Strangers Interaction',
    description:
      'Meet new people and connect beyond your usual circle.',
    image: '/friends/park-gathering.png',
    alt: 'A large group of people meeting outdoors',
  },
  {
    title: 'Human Connections',
    description:
      'Build genuine connections through shared experiences.',
    image: '/friends/friends-together.png',
    alt: 'Friends coming together and sharing a moment',
  },
  {
    title: 'Fun Games',
    description:
      'Enjoy exciting, team-based and interactive games.',
    image: '/friends/gathering.jpg',
    alt: 'Friends sitting together as a group',
  },
  {
    title: 'Unexpected Conversations',
    description:
      'Get ready for random topics, interesting questions and surprising discussions.',
    image: '/friends/unexpected-conversation.png',
    alt: 'Friends gathered in a cozy room, sharing an evening conversation',
  },
  {
    title: 'Fun Challenges',
    description:
      'Step out of your comfort zone with unexpected challenges.',
    image: '/friends/stories.jpg',
    alt: 'Friends gathered around a table sharing stories',
  },
  {
    title: 'Trending Poses & Reels',
    description:
      'Strike trending poses, create Instagram-worthy moments and make reels together.',
    image: '/friends/friends-on-campus.png',
    alt: 'A group of friends posing together on a campus lawn',
  },
]

function ArrowIcon({ diagonal = false }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 20 20"
      fill="none"
    >
      {diagonal ? (
        <path
          d="M5 15 15 5M6 5h9v9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3.5 10h12m-5-5 5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

function Field({ field, value, onChange }) {
  const { name, label, ...inputProps } = field
  const isPhone = name === 'phone'

  return (
    <label className="block" htmlFor={name}>
      <span className="mb-2 block text-sm font-medium text-stone-800">
        {label}
      </span>
      {isPhone ? (
        <div className="flex overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 focus-within:border-forest-700 focus-within:ring-4 focus-within:ring-forest-700/10">
          <span className="flex items-center border-r border-stone-200 px-4 text-[15px] font-medium text-stone-700">
            +91
          </span>
          <input
            {...inputProps}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required
            className="form-input min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[15px] text-stone-900 outline-none placeholder:text-stone-400"
          />
        </div>
      ) : (
        <input
          {...inputProps}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="form-input w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-[15px] text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-forest-700 focus:ring-4 focus:ring-forest-700/10"
        />
      )}
    </label>
  )
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const carouselRef = useRef(null)
  const carouselTrackRef = useRef(null)

  useEffect(() => {
    const carousel = carouselRef.current
    const track = carouselTrackRef.current

    if (!carousel || !track) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animation
    let frameId = 0
    let currentSpeed = 1
    let targetSpeed = 1
    let pointerX = -1
    let pointerY = -1

    function updateTargetSpeed() {
      if (!animation) return

      const bounds = carousel.getBoundingClientRect()
      const distanceX = Math.max(bounds.left - pointerX, 0, pointerX - bounds.right)
      const distanceY = Math.max(bounds.top - pointerY, 0, pointerY - bounds.bottom)
      const distance = Math.hypot(distanceX, distanceY)
      const proximity = Math.min(distance / 240, 1)

      targetSpeed = 0.16 + proximity * proximity * 0.84

      if (!frameId) frameId = window.requestAnimationFrame(updateSpeed)
    }

    function updateSpeed() {
      frameId = 0
      currentSpeed += (targetSpeed - currentSpeed) * 0.12

      if (Math.abs(targetSpeed - currentSpeed) < 0.005) {
        currentSpeed = targetSpeed
      }

      animation?.updatePlaybackRate(currentSpeed)

      if (currentSpeed !== targetSpeed) {
        frameId = window.requestAnimationFrame(updateSpeed)
      }
    }

    function handlePointerMove(event) {
      if (event.pointerType !== 'mouse') return

      pointerX = event.clientX
      pointerY = event.clientY
      updateTargetSpeed()
    }

    function resetSpeed() {
      targetSpeed = 1
      if (!frameId) frameId = window.requestAnimationFrame(updateSpeed)
    }

    function syncMotionPreference() {
      animation?.cancel()
      animation = undefined
      currentSpeed = 1
      targetSpeed = 1

      if (!reducedMotion.matches) {
        animation = track.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
          { duration: 48000, iterations: Infinity, easing: 'linear' },
        )
        updateTargetSpeed()
      }
    }

    syncMotionPreference()
    reducedMotion.addEventListener('change', syncMotionPreference)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', resetSpeed)
    window.addEventListener('blur', resetSpeed)
    window.addEventListener('scroll', updateTargetSpeed, { passive: true })
    window.addEventListener('resize', updateTargetSpeed)

    return () => {
      reducedMotion.removeEventListener('change', syncMotionPreference)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', resetSpeed)
      window.removeEventListener('blur', resetSpeed)
      window.removeEventListener('scroll', updateTargetSpeed)
      window.removeEventListener('resize', updateTargetSpeed)
      window.cancelAnimationFrame(frameId)
      animation?.cancel()
    }
  }, [])

  function handleChange(event) {
    const { name } = event.target
    let { value } = event.target
    if (name === 'phone') {
      value = value.replace(/\D/g, '')
      if (value.startsWith('91') && value.length > 10) value = value.slice(2)
      value = value.slice(0, 10)
    }
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setSubmissionError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setRegistering(true)
    setSubmissionError('')

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: `+91${form.phone}` }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error ?? 'Could not save your registration.')
      }

      setSubmitted(true)
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'Could not save your registration. Please try again.',
      )
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#faf9f6] text-stone-900">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a
          href="#home"
          className="taranga-header-logo rounded-sm"
          aria-label="Taranga home"
        >
          <img src="/taranga-logo.png" alt="Taranga" />
        </a>
        <nav className="flex items-center gap-5 sm:gap-9" aria-label="Main">
          <a
            href="#event-guide"
            className="hidden text-sm text-stone-600 transition hover:text-forest-800 sm:inline"
          >
            Event details
          </a>
          <a
            href="#registration"
            className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 sm:px-5"
          >
            Save your spot <ArrowIcon diagonal />
          </a>
        </nav>
      </header>

      <main>
        <section
          id="home"
          className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-16 pt-8 text-center sm:px-8 sm:pb-20 sm:pt-12 lg:px-12 lg:pb-20 lg:pt-14"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3.5 py-2 text-xs font-medium tracking-wide text-stone-700 shadow-sm">
              <span className="size-2 rounded-full bg-blue-600" />
              AN OPEN INVITATION
            </div>
            <h1 className="font-display text-[clamp(2.9rem,11.5vw,5.75rem)] leading-[0.98] tracking-[-0.045em] text-stone-950 sm:text-[clamp(4.4rem,7vw,7.5rem)]">
              NAMMAVARU
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-stone-600 sm:mt-6 sm:text-base sm:leading-8">
              Kannada culture <span className="px-1.5 text-[#a86e4d]">·</span>
              Human connection <span className="px-1.5 text-[#a86e4d]">·</span>
              Unexpected conversations{' '}
              <span className="px-1.5 text-[#a86e4d]">·</span>
              Roots &amp; Stories <span className="px-1.5 text-[#a86e4d]">·</span>
              Challenges
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#registration"
                className="inline-flex items-center gap-3 rounded-full bg-[#1d3c31] px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-forest-950/10 transition hover:-translate-y-0.5 hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
              >
                Register for free <ArrowIcon />
              </a>
              <span className="text-sm text-stone-500">No ticket cost</span>
            </div>
            <div className="mt-10 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
              <span className="h-px w-9 bg-stone-300" />
              Come as you are
              <span className="h-px w-9 bg-stone-300" />
            </div>
          </div>
        </section>

        <section
          className="community-showcase pb-16 sm:pb-20 lg:pb-24"
          aria-labelledby="community-heading"
        >
          <div className="mx-auto max-w-7xl px-5 pb-5 sm:px-8 sm:pb-7 lg:px-12">
            <h2
              id="community-heading"
              className="text-center text-xl font-bold tracking-tight text-stone-950 sm:text-2xl"
            >
              PROJECT UNKNOWN-Strangers Edition
            </h2>
          </div>
          <div
            ref={carouselRef}
            className="community-carousel w-full overflow-hidden py-4 sm:py-6"
            role="region"
            aria-label="Stories from the PROJECT UNKNOWN community"
            tabIndex={0}
          >
            <div className="community-carousel__track" ref={carouselTrackRef}>
              {[0, 1].map((copy) => (
                <div
                  className="community-carousel__group"
                  key={copy}
                  aria-hidden={copy === 1}
                >
                  {communityMoments.map((moment) => (
                    <figure className="community-carousel__card" key={moment.image}>
                      <img
                        src={moment.image}
                        alt={moment.alt}
                        className="size-full object-cover"
                        loading={copy === 0 ? 'eager' : 'lazy'}
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-14 text-sm font-medium text-white sm:px-6 sm:pb-6">
                        {moment.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="details"
          className="scroll-mt-8 border-y border-stone-200/80 bg-white/70"
        >
          <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3 lg:px-12">
            <div className="border-b border-stone-200 py-7 md:border-b-0 md:border-r md:py-9 md:pr-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                When
              </p>
              <p className="mt-2 text-lg font-medium text-stone-900">
                08 Nov 2026
              </p>
            </div>
            <div className="border-b border-stone-200 py-7 md:border-b-0 md:border-r md:px-8 md:py-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Where
              </p>
              <p className="mt-2 text-lg font-medium text-stone-900">
                Venue details coming soon
              </p>
            </div>
            <div className="py-7 md:py-9 md:pl-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Entry
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-medium text-stone-900">
                Free for everyone
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                  Free
                </span>
              </p>
            </div>
          </div>
        </section>

        <section
          id="event-guide"
          className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
          aria-labelledby="event-guide-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                The event guide
              </p>
              <h2
                id="event-guide-heading"
                className="mt-4 font-display text-4xl leading-tight tracking-[-0.045em] text-stone-950 sm:text-5xl lg:text-6xl"
              >
                All You Need to Know About the Event
              </h2>
            </div>
            <ol className="event-flow mt-8 space-y-4 sm:mt-10 sm:space-y-5">
              {eventFlow.map((event, index) => (
                <li className="event-flow__item" key={event.title}>
                  <div className="event-flow__image-wrap">
                    <img
                      className="event-flow__image"
                      src={event.image}
                      alt={event.alt}
                      loading="lazy"
                    />
                    <span className="event-flow__number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="event-flow__copy">
                    <p className="event-flow__eyebrow">
                      The experience
                    </p>
                    <h3 className="font-display text-2xl leading-tight text-stone-950 sm:text-3xl">
                      {event.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                      {event.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="registration"
          className="mx-auto grid max-w-7xl scroll-mt-8 items-start gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-12 lg:py-28"
        >
          <div className="pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
              Your next hello starts here
            </p>
            <h2 className="mt-5 max-w-lg font-display text-5xl leading-[0.98] tracking-[-0.055em] text-stone-950 sm:text-6xl">
              Join us at
              <br />
              NAMMAVARU.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-stone-600">
              Add your details to get started. Your ticket is free, and we&apos;ll
              add the remaining event details to the event guide as they&apos;re
              confirmed.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-stone-600">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#e8eee8] text-forest-900">
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="m5 10 3.2 3.2L15.5 6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Free registration · Takes about a minute</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_24px_70px_-45px_rgba(27,39,32,0.28)] sm:p-8 lg:p-10">
            {submitted ? (
              <div
                className="py-3 sm:py-6"
                role="status"
                aria-live="polite"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-forest-100 text-forest-900">
                  <svg
                    aria-hidden="true"
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="m5 12 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-forest-800">
                  NAMMAVARU · Registration saved
                </p>
                <h3 className="mt-3 font-display text-4xl tracking-tight text-stone-950">
                  Thanks, {form.name.split(' ')[0]}.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">
                  Your registration has been saved to the NAMMAVARU workbook.
                  Your ticket is free; event date and location details will be
                  shared once they&apos;re confirmed.
                </p>
                <div className="my-7 rounded-2xl bg-[#f7f7f3] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Registration details
                  </p>
                  <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
                    <dt className="text-stone-500">Name</dt>
                    <dd className="text-right font-medium text-stone-800">
                      {form.name}
                    </dd>
                    <dt className="text-stone-500">Email</dt>
                    <dd className="break-all text-right font-medium text-stone-800">
                      {form.email}
                    </dd>
                    <dt className="text-stone-500">Ticket</dt>
                    <dd className="text-right font-medium text-forest-800">
                      Free
                    </dd>
                  </dl>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      Registration
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                      Save your spot
                    </h3>
                  </div>
                  <span className="rounded-full bg-forest-100 px-3 py-1.5 text-xs font-semibold text-forest-900">
                    Free ticket
                  </span>
                </div>
                <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                  {fields.map((field) => (
                    <Field
                      key={field.name}
                      field={field}
                      value={form[field.name]}
                      onChange={handleChange}
                    />
                  ))}
                  <button
                    type="submit"
                    disabled={registering}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
                  >
                    {registering ? 'Saving your registration…' : 'Continue with free registration'}
                    {!registering && <ArrowIcon />}
                  </button>
                  {submissionError && (
                    <p
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
                      role="alert"
                    >
                      {submissionError}
                    </p>
                  )}
                  <p className="text-center text-xs leading-5 text-stone-500">
                    Your registration is saved to the local NAMMAVARU workbook.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="taranga-footer">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-10 pt-16 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-12 lg:pt-24">
          <div className="taranga-wordmark-art">
            <p className="taranga-wordmark" aria-label="Taranga">
              TARANGA
            </p>
          </div>
          <p className="taranga-tagline">
            we handle the chaos, you live the Moment
          </p>
          <nav
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            aria-label="Social links"
          >
            <a
              href="https://www.instagram.com/taranga_org/"
              target="_blank"
              rel="noreferrer"
              className="taranga-social-link"
              aria-label="Open Taranga on Instagram"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.5" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
              Instagram
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="taranga-social-link"
              aria-label="Open the Taranga WhatsApp community"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8.5c.3-.6.6-.6.9-.6h.4c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4-.1.6.4.7 1 1.3 1.7 1.7.2.1.4.1.6-.1l.6-.5c.2-.2.4-.2.6-.1l1.7.8c.2.1.3.3.3.5 0 .3-.2.8-.5 1-.4.4-1 .6-1.6.5-1-.1-2.2-.7-3.3-1.7-1.1-1-1.8-2.3-2-3.2-.2-.9.1-1.7.5-2.2Z"
                  fill="currentColor"
                />
              </svg>
              WhatsApp community
            </a>
          </nav>
          <a className="taranga-back-to-top" href="#home">
            Back to top <ArrowIcon diagonal />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
