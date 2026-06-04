import './styles.css'

if (card) {
  const config = thisCard.config.frigate_player
  const paramName = config?.param ?? 'video'
  const autoplay = config?.autoplay ?? true
  const muted = config?.muted ?? true
  const loop = config?.loop ?? false

  const params = new URLSearchParams(window.location.search)
  const videoUrl = params.get(paramName)

  const DATA_KEY = 'data-frigate-player'
  const DATA_SRC_KEY = 'data-frigate-player-src'

  card.style.position = 'relative'

  let wrapper = card.querySelector<HTMLElement>(`[${DATA_KEY}]`)
  let video: HTMLVideoElement | null = wrapper?.querySelector('video') ?? null

  if (!videoUrl) {
    card.classList.remove('bubble-frigate-player--active')
    if (wrapper) wrapper.style.display = 'none'
  } else {
    if (!wrapper) {
      // ── Wrapper ────────────────────────────────────────────────────────────
      wrapper = document.createElement('div')
      wrapper.setAttribute(DATA_KEY, '')
      wrapper.className = 'bfp-wrapper'

      // ── Info header ────────────────────────────────────────────────────────
      const header = document.createElement('div')
      header.className = 'bfp-header'
      wrapper.appendChild(header)

      // ── Video ──────────────────────────────────────────────────────────────
      video = document.createElement('video')
      video.className = 'bfp-video'
      video.playsInline = true
      wrapper.appendChild(video)

      // ── Controls ────────────────────────────────────────────────────────────
      const controls = document.createElement('div')
      controls.className = 'bfp-controls'

      const mkBtn = (svg: string, cls: string) => {
        const b = document.createElement('button')
        b.className = `bfp-btn ${cls}`
        b.innerHTML = svg
        return b
      }

      const ICON_PLAY  = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
      const ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      const ICON_VOL   = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`
      const ICON_MUTE  = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
      const ICON_FS    = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`
      const ICON_EXIT  = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`

      const playBtn = mkBtn(ICON_PLAY, 'bfp-play')
      const seek    = document.createElement('input')
      const time    = document.createElement('span')
      const muteBtn = mkBtn(ICON_VOL, 'bfp-mute')
      const fsBtn   = mkBtn(ICON_FS,  'bfp-fs')

      seek.type      = 'range'
      seek.className = 'bfp-seek'
      seek.min = '0'; seek.max = '100'; seek.value = '0'; seek.step = '0.1'
      time.className = 'bfp-time'
      time.textContent = '0:00 / 0:00'

      controls.append(playBtn, seek, time, muteBtn, fsBtn)
      wrapper.appendChild(controls)
      card.appendChild(wrapper)

      // ── Helpers ────────────────────────────────────────────────────────────
      const fmt = (t: number) => {
        const m = Math.floor(t / 60)
        const s = Math.floor(t % 60).toString().padStart(2, '0')
        return `${m}:${s}`
      }
      const updateSeek = (pct: number) => {
        // CSS custom property is read by ::-webkit-slider-runnable-track.
        // Setting it on the element (not seek.style.background) keeps the
        // input's own background transparent, so the 20px touch-target
        // height doesn't produce a visible filled bar.
        seek.style.setProperty('--bfp-p', `${pct}%`)
      }
      updateSeek(0)

      // ── Listeners ──────────────────────────────────────────────────────────
      video.addEventListener('click', () => {
        video!.paused ? video!.play() : video!.pause()
      })

      let dragging = false
      seek.addEventListener('pointerdown', () => { dragging = true })
      // Use both pointerup and pointercancel so dragging never gets stuck
      const endDrag = () => { dragging = false }
      seek.addEventListener('pointerup', endDrag)
      seek.addEventListener('pointercancel', endDrag)

      playBtn.addEventListener('click', () => {
        video!.paused ? video!.play() : video!.pause()
      })
      video.addEventListener('play',  () => { playBtn.innerHTML = ICON_PAUSE })
      video.addEventListener('pause', () => { playBtn.innerHTML = ICON_PLAY  })
      video.addEventListener('loadedmetadata', () => {
        time.textContent = `0:00 / ${fmt(video!.duration)}`
      })
      video.addEventListener('timeupdate', () => {
        if (dragging || !video!.duration) return
        const pct = (video!.currentTime / video!.duration) * 100
        seek.value = String(pct)
        updateSeek(pct)
        time.textContent = `${fmt(video!.currentTime)} / ${fmt(video!.duration)}`
      })
      seek.addEventListener('input', () => {
        if (!video!.duration) return
        const pct = Number(seek.value)
        video!.currentTime = (pct / 100) * video!.duration
        updateSeek(pct)
        time.textContent = `${fmt(video!.currentTime)} / ${fmt(video!.duration)}`
      })
      muteBtn.addEventListener('click', () => {
        video!.muted = !video!.muted
        muteBtn.innerHTML = video!.muted ? ICON_MUTE : ICON_VOL
      })
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          wrapper!.requestFullscreen()
          fsBtn.innerHTML = ICON_EXIT
        } else {
          document.exitFullscreen()
        }
      })
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) fsBtn.innerHTML = ICON_FS
      })
    }

    // ── Update info header from URL params ──────────────────────────────────
    const header = wrapper.querySelector<HTMLElement>('.bfp-header')!
    const camera   = params.get('camera')
    const label    = params.get('label')
    const sublabel = params.get('sublabel')
    const zones    = params.get('zones')   // comma-separated
    const plate    = params.get('plate')

    const hasInfo = camera || label || sublabel || zones || plate
    header.style.display = hasInfo ? '' : 'none'

    if (hasInfo) {
      // Left: camera name
      // Right: label [ • sublabel ] [ plate chip ]
      // Row 2 (if zones): zone chips
      const escape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

      const labelHtml = label
        ? `<span class="bfp-label">${escape(label)}${sublabel ? `<span class="bfp-sublabel"> · ${escape(sublabel)}</span>` : ''}</span>`
        : ''

      const plateHtml = plate
        ? `<span class="bfp-chip bfp-chip--plate">${escape(plate)}</span>`
        : ''

      const zonesHtml = zones
        ? zones.split(',').map(z => `<span class="bfp-chip">${escape(z.trim())}</span>`).join('')
        : ''

      const cameraHtml = camera
        ? `<span class="bfp-camera">${escape(camera.replace(/_/g, ' '))}</span>`
        : ''

      header.innerHTML = `
        <div class="bfp-header-row">
          ${cameraHtml}
          <div class="bfp-header-right">${labelHtml}${plateHtml}</div>
        </div>
        ${zonesHtml ? `<div class="bfp-header-zones">${zonesHtml}</div>` : ''}
      `
    }

    wrapper.style.display = ''
    video!.autoplay = autoplay
    video!.muted    = muted
    video!.loop     = loop

    if (video!.getAttribute(DATA_SRC_KEY) !== videoUrl) {
      video!.setAttribute(DATA_SRC_KEY, videoUrl)
      video!.src = videoUrl
      video!.load()
      if (autoplay) video!.play().catch(() => {})
    }

    wrapper.classList.add('active')
    card.classList.add('bubble-frigate-player--active')
  }
}
