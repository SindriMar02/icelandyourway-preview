$(document).ready(function () {
  var isHomepage = window.location.pathname === '/icelandyourway-preview/'

  // On non-homepage, change #retreats links to go to homepage
  if (!isHomepage) {
    $('a[href="#retreats"]').attr('href', '/#retreats')
  }

  // Scroll to hash on page load
  var hash = window.location.hash
  if (hash) {
    $(window).on('load', function () {
      var $target = $(hash)
      if ($target.length) {
        setTimeout(function () {
          $('html, body').animate(
            {
              scrollTop: $target.offset().top - 40,
            },
            600,
          )
        }, 100)
      }
    })
  }

  // Mobile slider for retreat photos
  function initMobileSlider() {
    var $slider = $('.retreat-page-intro__photos')
    var $statisticSlider = $('.statistic__items:not([data-static-grid])')
    var $practitionersSlider = $('.practitioners__list')

    if ($(window).width() <= 479) {
      $slider.slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        arrows: false,
      })

      $statisticSlider.slick({
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        variableWidth: true,
      })

      $practitionersSlider.slick({
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        variableWidth: true,
      })
    }
  }

  initMobileSlider()

  

  // Smooth scroll on nav click
  var isScrolling = false

  $(document).on(
    'click',
    '.retreat-page-info__link a[data-target]',
    function (e) {
      e.preventDefault()

      var $this = $(this)
      var target = $this.data('target')
      var $section = $('#' + target)

      // Set active class on all matching links (desktop + mobile navs)
      $('.retreat-page-info__link a').removeClass('is-active')
      $('.retreat-page-info__link a[data-target="' + target + '"]').addClass(
        'is-active',
      )

      if ($section.length) {
        var headerHeight = $('.header').outerHeight() || 0
        var offset = headerHeight + 20

        // On mobile, add sticky nav height
        if ($(window).width() <= 479) {
          var navHeight = $('.retreat-page-info__nav').outerHeight() || 0
          offset = headerHeight + navHeight + 20
        }

        isScrolling = true

        if (window.gsap && window.ScrollToPlugin) {
          gsap.to(window, {
            scrollTo: { y: $section[0], offsetY: offset },
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: function () {
              setTimeout(function () {
                isScrolling = false
              }, 100)
            },
          })
        } else {
          $('html, body').animate(
            {
              scrollTop: $section.offset().top - offset + 1,
            },
            600,
            function () {
              setTimeout(function () {
                isScrolling = false
              }, 100)
            },
          )
        }
      }
    },
  )

  // Scroll spy - highlight active nav link
  function updateActiveNav() {
    // Skip if currently scrolling from nav click
    if (isScrolling) return

    var navHeight = 60

    // On mobile, use sticky nav height
    if ($(window).width() <= 479) {
      navHeight = $('.retreat-page-info__nav').outerHeight() || 60
    }

    var scrollPos = $(window).scrollTop() + navHeight + 20
    var $navLinks = $('.retreat-page-info__link a[data-target]')
    var sections = []

    // Build array of sections with their positions
    $navLinks.each(function () {
      var target = $(this).data('target')
      var $section = $('#' + target)

      if ($section.length) {
        sections.push({
          target: target,
          top: $section.offset().top,
          $link: $(this),
        })
      }
    })

    // Check if near bottom of page - highlight last section
    var windowHeight = $(window).height()
    var documentHeight = $(document).height()
    var scrollTop = $(window).scrollTop()

    if (scrollTop + windowHeight >= documentHeight - 100) {
      $navLinks.removeClass('is-active')
      var lastTarget = sections[sections.length - 1].target
      $(
        '.retreat-page-info__link a[data-target="' + lastTarget + '"]',
      ).addClass('is-active')
      return
    }

    // Find active section (current scroll position is past section top, but before next section)
    var found = false
    for (var i = 0; i < sections.length; i++) {
      var current = sections[i]
      var next = sections[i + 1]
      var sectionTop = current.top
      var sectionBottom = next ? next.top : Infinity

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        $navLinks.removeClass('is-active')
        $(
          '.retreat-page-info__link a[data-target="' + current.target + '"]',
        ).addClass('is-active')
        found = true
        break
      }
    }

    // If no section found (above first section), highlight first item
    if (!found && sections.length) {
      $navLinks.removeClass('is-active')
      $(
        '.retreat-page-info__link a[data-target="' + sections[0].target + '"]',
      ).addClass('is-active')
    }

    // Auto-scroll nav on mobile to show active link
    if ($(window).width() <= 479) {
      var $activeLink = $('.retreat-page-info__link a.is-active')
      var $nav = $('.retreat-page-info__nav')

      if ($activeLink.length && $nav.length) {
        var linkLeft = $activeLink.parent().position().left + $nav.scrollLeft()
        var offset = parseFloat($('html').css('font-size')) * 1.25
        $nav.scrollLeft(linkLeft - offset)
      }
    }
  }

  if ($('.retreat-page-info__nav').length) {
    $(window).on('scroll', updateActiveNav)
    updateActiveNav()
  }

  // Equalize heights of coaches info heads
  function equalizeHeights() {
    var $items = $('.coaches-person-info__head')

    if ($(window).width() <= 479) {
      $items.css('height', 'auto')
      return
    }

    var maxHeight = 0

    $items.css('height', 'auto')

    $items.each(function () {
      var h = $(this).outerHeight()
      if (h > maxHeight) {
        maxHeight = h
      }
    })

    $items.css('height', maxHeight)
  }

  equalizeHeights()
  $(window).on('resize', equalizeHeights)

  // Form validation and submission
  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function validateForm($form) {
    var isValid = true

    $form.find('.inp-group').removeClass('is-error')

    $form.find('input[required], textarea[required]').each(function () {
      var $input = $(this)
      var $group = $input.closest('.inp-group')
      var value = $input.val().trim()
      var type = $input.attr('type')

      if (!value) {
        $group.addClass('is-error')
        isValid = false
      } else if (type === 'email' && !validateEmail(value)) {
        $group.addClass('is-error')
        isValid = false
      }
    })

    return isValid
  }

  function sendForm($form) {
    var endPointId = $('html').attr('data-wf-site')
    var pageId = $('html').attr('data-wf-page')
    var $elementWithId = $('[data-wf-element-id]')
    var elementId = $elementWithId.length
      ? $elementWithId.attr('data-wf-element-id')
      : ''
    var domain = window.location.hostname
    var url = '/__preview/form'

    // Get form name from native Webflow form
    var $nativeForm = $form.closest('.w-form').find('form[data-wf-page-id]')
    var formName =
      $nativeForm.attr('data-name') || $form.attr('data-form-type') || 'Contact'

    var data = new URLSearchParams()
    data.append('name', formName)
    data.append('source', window.location.href)
    data.append('test', 'false')
    data.append('dolphin', 'false')
    if (pageId) data.append('pageId', pageId)
    if (elementId) data.append('elementId', elementId)
    data.append('domain', domain)

    $form.find('input, textarea, select').each(function () {
      var $input = $(this)
      var name = $input.attr('name')
      var type = $input.attr('type')

      // Skip turnstile response - we'll get it from native form
      if (name && name !== 'cf-turnstile-response') {
        if (type === 'checkbox') {
          data.append(
            'fields[' + name + ']',
            $input.is(':checked') ? 'true' : 'false',
          )
        } else if (type === 'radio') {
          if ($input.is(':checked')) {
            data.append('fields[' + name + ']', $input.val())
          }
        } else {
          data.append('fields[' + name + ']', $input.val().trim())
        }
      }
    })

    // Get turnstile response from native Webflow form
    var turnstileResponse = $nativeForm
      .find('input[name="cf-turnstile-response"]')
      .val()
    if (turnstileResponse) {
      data.append('fields[cf-turnstile-response]', turnstileResponse)
    }

    data.append('fields[submit_url]', window.location.href)

    $form.addClass('is-sending')

    $.ajax({
      url: url,
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      data: data.toString(),
      success: function () {
        $form.closest('.contact-us__content').addClass('is-sended')
        $form[0].reset()
        $form.removeClass('is-sending')
      },
      error: function () {
        $form.removeClass('is-sending')
      },
    })
  }

  // Form submit handler
  $('.form').on('submit', function (e) {
    e.preventDefault()

    var $form = $(this)

    if (!validateForm($form)) return

    sendForm($form)
  })

  // Submit on button click (for non-submit buttons)
  $('.form .btn-primary').on('click', function (e) {
    e.preventDefault()

    var $form = $(this).closest('.form')

    if (!validateForm($form)) return

    sendForm($form)
  })

  // Remove error on input
  $('.inp-group__input, .inp-group__textarea').on('input', function () {
    $(this).closest('.inp-group').removeClass('is-error')
  })

  // Nav
  const $navItems = $('.legal-nav__items')
  const $sections = $('[data-legal-nav]')

  // Замінюємо вміст навігації
  $navItems.empty()

  $sections.each(function () {
    const $section = $(this)

    const $link = $('<a>', {
      href: '#',
      class: 'legal-nav__link',
      text: $section.text().trim(),
    })

    $link.on('click', function (e) {
      e.preventDefault()
      var headerHeight = $('.header').outerHeight() || 0
      if (window.gsap && window.ScrollToPlugin) {
        gsap.to(window, {
          scrollTo: { y: $section[0], offsetY: headerHeight + 20 },
          duration: 0.8,
          ease: 'power2.inOut',
        })
      } else {
        $('html, body').animate({ scrollTop: $section.offset().top - headerHeight - 20 }, 400)
      }
    })

    $('<div>', { class: 'legal-nav__item' }).append($link).appendTo($navItems)
  })

  // Scroll spy
  const $links = $navItems.find('.legal-nav__link')

  $(window).on('scroll', function () {
    const scrollTop = $(this).scrollTop()
    const threshold = $(this).height() * 0.2

    let activeIndex = 0

    $sections.each(function (i) {
      if ($(this).offset().top - scrollTop <= threshold) {
        activeIndex = i
      }
    })

    $links.removeClass('is-active').eq(activeIndex).addClass('is-active')
  })

  $links.first().addClass('is-active')

  // Burger menu
  $('.btn-burger').on('click', function () {
    $(this).toggleClass('is-active')
    $('.mobile-menu').toggleClass('is-active')
  })

  $('.header-nav__link, .header__button .btn-primary').on('click', function () {
    $('.btn-burger').removeClass('is-active')
    $('.mobile-menu').removeClass('is-active')
  })

  

  // Cookie banner
  var $cookie = $('.cookie')

  function updateCookiePadding() {
    if ($cookie.hasClass('is-active')) {
      $('body').css('padding-bottom', $cookie.outerHeight())
    } else {
      $('body').css('padding-bottom', '')
    }
  }

  function closeCookieBanner() {
    $cookie.removeClass('is-active')
    localStorage.setItem('cookie_accepted', '1')
  }

  if ($cookie.length && !localStorage.getItem('cookie_accepted')) {
    $cookie.addClass('is-active')

    var observer = new MutationObserver(updateCookiePadding)
    observer.observe($cookie[0], {
      attributes: true,
      attributeFilter: ['class'],
    })
    $(window).on('resize', updateCookiePadding)
  }

  updateCookiePadding()

  $(
    '.cookie__close, .cookie__controls .btn-primary, .cookie__controls .btn-secondary',
  ).on('click', function () {
    closeCookieBanner()
  })

  if (window.vitaMotionPreference && window.vitaMotionPreference.reduced) return;

  // Animations
  var AnimUtils = (function () {
    var DEFAULTS = {
      duration: 0.8,
      distance: 40,
      ease: 'power3.out',
      start: 'top 88%',
      speed: 0.03,
    }

    var PRESETS = {
      fade: function () {
        return { from: { opacity: 0 } }
      },
      'fade-up': function (d) {
        return { from: { opacity: 0, y: d } }
      },
      'fade-up-big': function () {
        return { from: { opacity: 0, y: 200 } }
      },
      'fade-down': function (d) {
        return { from: { opacity: 0, y: -d } }
      },
      'fade-left': function (d) {
        return { from: { opacity: 0, x: -d } }
      },
      'fade-right': function (d) {
        return { from: { opacity: 0, x: d } }
      },
      'zoom-in': function () {
        return { from: { opacity: 0, scale: 0.85 } }
      },
      'zoom-out': function () {
        return { from: { opacity: 0, scale: 1.15 } }
      },
      'blur-in': function () {
        return {
          from: { opacity: 0, filter: 'blur(12px)' },
          clearProps: 'filter',
        }
      },
    }

    function getAttr(el, attr, fallback) {
      var val = el.dataset[attr]
      return val !== undefined ? val : fallback
    }

    function initTypewriter(el) {
      var delay = parseFloat(getAttr(el, 'animDelay', 0))
      var speed = parseFloat(getAttr(el, 'animSpeed', DEFAULTS.speed))
      var start = getAttr(el, 'animStart', DEFAULTS.start)
      var once = getAttr(el, 'animOnce', 'true') !== 'false'

      var split = new SplitText(el, { type: 'words,chars', wordsClass: 'tw-word', charsClass: 'tw-char' })

      gsap.set(split.chars, { opacity: 0 })

      function playAnim() {
        gsap.to(split.chars, {
          keyframes: [
            { opacity: 0.4, duration: speed * 2, ease: 'none' },
            { opacity: 1, duration: speed * 6, ease: 'power1.out' },
          ],
          stagger: speed,
          delay: delay,
        })
      }

      function resetAnim() {
        gsap.set(split.chars, { opacity: 0 })
      }

      ScrollTrigger.create({
        trigger: el,
        start: start,
        once: once,
        onEnter: playAnim,
        onLeaveBack: !once ? resetAnim : undefined,
      })
    }

    function init(scope) {
      if (!window.gsap || !window.ScrollTrigger) return

      gsap.registerPlugin(ScrollTrigger)

      var root = scope || document
      var elements = root.querySelectorAll('[data-anim]')

      elements.forEach(function (el) {
        var animType = el.dataset.anim

        if (animType === 'typewriter') {
          if (!window.SplitText) return
          gsap.registerPlugin(SplitText)
          initTypewriter(el)
          return
        }

        var preset = PRESETS[animType]
        if (!preset) return

        var duration = parseFloat(
          getAttr(el, 'animDuration', DEFAULTS.duration),
        )
        var delay = parseFloat(getAttr(el, 'animDelay', 0))
        var distance = parseFloat(
          getAttr(el, 'animDistance', DEFAULTS.distance),
        )
        var ease = getAttr(el, 'animEase', DEFAULTS.ease)
        var start = getAttr(el, 'animStart', DEFAULTS.start)
        var once = getAttr(el, 'animOnce', 'true') !== 'false'
        var stagger = parseFloat(getAttr(el, 'animStagger', 0))

        var result = preset(distance)
        var from = result.from
        var clearProps = result.clearProps || ''
        var targets = stagger > 0 ? el.children : el

        gsap.set(targets, from)

        ScrollTrigger.create({
          trigger: el,
          start: start,
          once: once,
          onEnter: function () {
            gsap.to(targets, {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: clearProps ? 'blur(0px)' : undefined,
              duration: duration,
              delay: delay,
              ease: ease,
              stagger: stagger || 0,
              clearProps: clearProps,
            })
          },
          onLeaveBack: !once
            ? function () {
                gsap.set(targets, from)
              }
            : undefined,
        })
      })
    }

    function kill() {
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach(function (t) {
          t.kill()
        })
      }
    }

    return { init: init, kill: kill }
  })()

  // Smooth scroll
  if (window.gsap && window.ScrollSmoother && window.ScrollTrigger) {
    var plugins = [ScrollTrigger, ScrollSmoother]
    if (window.ScrollToPlugin) plugins.push(ScrollToPlugin)
    gsap.registerPlugin.apply(gsap, plugins)

    ScrollSmoother.create({
      wrapper: '.page-wrapper',
      content: '.main-wrapper',
      smooth: 1.2,
      effects: true,
    })
  }

  AnimUtils.init()

  // Header dec animations (only above 479px)
  if (window.gsap && window.innerWidth > 479) {
    var dec1 = document.querySelector('.header__dec--1')
    var dec2 = document.querySelector('.header__dec--2')
    var dec3 = document.querySelector('.header__dec--3')

    if (dec1) {
      gsap.set(dec1, { scaleX: 0, transformOrigin: 'left center' })
      gsap.to(dec1, { scaleX: 1, duration: 0.5, delay: 0.3, ease: 'power2.inOut' })
    }

    if (dec2) {
      gsap.set(dec2, { scaleY: 0, transformOrigin: 'center top' })
      gsap.to(dec2, { scaleY: 1, duration: 0.5, delay: 0.4, ease: 'power2.inOut' })
    }

    if (dec3) {
      gsap.set(dec3, { scaleY: 0, transformOrigin: 'center top' })
      gsap.to(dec3, { scaleY: 1, duration: 0.5, delay: 0.5, ease: 'power2.inOut' })
    }
  }

  // Intro button fade on mobile
  if (window.gsap && window.innerWidth <= 479) {
    var introBtn = document.querySelector('.intro__button.mobile-visible')
    if (introBtn) {
      gsap.set(introBtn, { opacity: 0, y: 30 })
      gsap.to(introBtn, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' })
    }
  }

  // Header
  var $header = $('.header')

  $(window).on('scroll', function () {
    $header.toggleClass('is-active', $(this).scrollTop() > 20)
  })

  // Retreats
  // Each recomposed category/statistics surface owns its original sequence.
  $('.statistic-section').each(function () {
  var $statistic = $(this)

  if ($statistic.length && window.gsap && window.ScrollTrigger) {
    var headTitle = $statistic.find('[data-anim="statistic-head-title"]')[0]
    var h2El = $statistic.find('[data-anim="statistic-h2"]')[0]
    var speed = 0.03
    var itemDelay = 0.3

    var borderTop = $statistic.find('[data-anim="statistic-border-top"]')[0]
    var borderBottom = $statistic.find('[data-anim="statistic-border-bottom"]')[0]
    var borderRight1 = $statistic.find('[data-anim="statistic-border-right-1"]')[0]
    var borderRight2 = $statistic.find('[data-anim="statistic-border-right-2"]')[0]

    if (headTitle) {
      gsap.set(headTitle, { opacity: 0, y: 40 })
    }

    var split = null
    var statisticMobile = window.innerWidth <= 479
    if (h2El && window.SplitText) {
      if (statisticMobile) {
        gsap.set(h2El, { opacity: 0, y: 30 })
      } else {
        split = new SplitText(h2El, { type: 'words,chars', wordsClass: 'tw-word', charsClass: 'tw-char' })
        gsap.set(split.chars, { opacity: 0 })
      }
    }

    if (borderTop) gsap.set(borderTop, { width: '0%' })
    if (borderBottom) gsap.set(borderBottom, { width: '0%' })
    if (borderRight1) gsap.set(borderRight1, { height: '0%' })
    if (borderRight2) gsap.set(borderRight2, { height: '0%' })

    var items = []
    for (var i = 1; i <= 4; i++) {
      var itemEl = $statistic.find('[data-anim="statistic-item-' + i + '"]')[0]
      if (!itemEl) continue

      var title = itemEl.querySelector('[data-anim="statistic-item-title"]')
      var subtitle = itemEl.querySelector('[data-anim="statistic-item-subtitle"]')
      var illustration = itemEl.querySelector('[data-anim="statistic-item-illustration"]')

      if (title) gsap.set(title, { opacity: 0, y: 30 })
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 30 })
      if (illustration) gsap.set(illustration, { opacity: 0, x: -40 })

      items.push({ title: title, subtitle: subtitle, illustration: illustration })
    }

    ScrollTrigger.create({
      trigger: $statistic[0],

      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()

        if (headTitle) {
          tl.to(headTitle, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          }, 0)
        }

        if (split) {
          tl.to(split.chars, {
            keyframes: [
              { opacity: 0.4, duration: speed * 2, ease: 'none' },
              { opacity: 1, duration: speed * 6, ease: 'power1.out' },
            ],
            stagger: speed,
          }, 0)
        } else if (h2El && statisticMobile) {
          tl.to(h2El, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, 0.2)
        }

        var typewriterMid = split ? split.chars.length * speed * 0.5 : 0.4

        if (borderTop) {
          tl.to(borderTop, {
            width: '100%', duration: 0.8, ease: 'power2.inOut',
          }, typewriterMid)
        }

        if (borderBottom) {
          tl.to(borderBottom, {
            width: '100%', duration: 0.8, ease: 'power2.inOut',
          }, typewriterMid)
        }

        var borderTopAt60 = typewriterMid + 0.8 * 0.6

        if (borderRight1) {
          tl.to(borderRight1, {
            height: 'calc(100% - 2px)', duration: 0.8, ease: 'power2.inOut',
          }, borderTopAt60)
        }

        if (borderRight2) {
          tl.to(borderRight2, {
            height: 'calc(100% - 2px)', duration: 0.8, ease: 'power2.inOut',
          }, borderTopAt60)
        }

        var bordersAt30 = typewriterMid + 0.8 * 0.3

        items.forEach(function (item, idx) {
          var offset = bordersAt30 + idx * itemDelay

          if (item.title) {
            tl.to(item.title, {
              opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            }, offset)
          }

          if (item.subtitle) {
            tl.to(item.subtitle, {
              opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            }, offset + 0.1)
          }

          if (item.illustration) {
            tl.to(item.illustration, {
              opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
            }, offset + 0.15)
          }
        })
      },
    })
  }

  })
  // About section
  var $about = $('.about-section')

  if ($about.length && window.gsap && window.ScrollTrigger && window.SplitText) {
    gsap.registerPlugin(SplitText)

    // 1. Head title (fade up like statistic-head-title)
    var aboutHead = $about.find('[data-anim="about-section-head"]')[0]
    if (aboutHead) gsap.set(aboutHead, { opacity: 0, y: 40 })

    // 2. Description (typewriter like statistic-h2)
    var aboutDesc = $about.find('[data-anim="about-head-description"]')[0]
    var aboutDescSplit = null
    var aboutSpeed = 0.03
    var aboutDescMobile = window.innerWidth <= 479
    if (aboutDesc) {
      if (aboutDescMobile) {
        gsap.set(aboutDesc, { opacity: 0, y: 30 })
      } else {
        aboutDescSplit = new SplitText(aboutDesc, { type: 'words,chars', charsClass: 'tw-char' })
        gsap.set(aboutDescSplit.chars, { opacity: 0 })
      }
    }

    // 3. Illustration (fade from left like statistic-item-illustration)
    var aboutIllustration = $about.find('[data-animation="about-illustration"]')[0]
    if (aboutIllustration) gsap.set(aboutIllustration, { opacity: 0, x: -40 })

    // 4. About head text - split by lines, slide up + color change
    var aboutHeadText = $about.find('[data-animation="about-head"]')[0]
    var aboutHeadSplit = null
    var aboutHeadMobile = window.innerWidth <= 479
    if (aboutHeadText) {
      if (aboutHeadMobile) {
        // Mobile: only chars, no line wrappers (avoids broken word wrapping)
        var aboutHeadHTMLMob = aboutHeadText.innerHTML
        aboutHeadSplit = new SplitText(aboutHeadText, { type: 'words,chars', charsClass: 'about-char' })
        // Re-add nbsp padding
        var nbspMatchMob = aboutHeadHTMLMob.match(/^((?:&nbsp;|\xA0| )+)/)
        if (nbspMatchMob && aboutHeadSplit.chars.length) {
          var spacerMob = document.createElement('span')
          spacerMob.innerHTML = nbspMatchMob[0]
          aboutHeadSplit.chars[0].parentNode.insertBefore(spacerMob, aboutHeadSplit.chars[0])
        }
        gsap.set(aboutHeadText, { opacity: 0, y: 30 })
        gsap.set(aboutHeadSplit.chars, { color: 'rgba(255,255,255,0.4)' })
      } else {
        // Desktop: lines + chars
        var aboutHeadHTML = aboutHeadText.innerHTML
        aboutHeadSplit = new SplitText(aboutHeadText, { type: 'lines,words,chars', linesClass: 'split-line', charsClass: 'about-char' })

        if (aboutHeadSplit.lines.length) {
          var nbspMatch = aboutHeadHTML.match(/^((?:&nbsp;|\xA0| )+)/)
          if (nbspMatch) {
            var spacer = document.createElement('span')
            spacer.innerHTML = nbspMatch[0]
            aboutHeadSplit.lines[0].insertBefore(spacer, aboutHeadSplit.lines[0].firstChild)
          }
        }

        aboutHeadSplit.lines.forEach(function (line) {
          var wrapper = document.createElement('div')
          wrapper.style.overflow = 'hidden'
          line.parentNode.insertBefore(wrapper, line)
          wrapper.appendChild(line)
        })
        gsap.set(aboutHeadSplit.lines, { y: '100%' })
        gsap.set(aboutHeadSplit.chars, { color: 'rgba(255,255,255,0.4)' })
      }
    }

    // 5. Item heads + descriptions - split by lines, slide up
    var aboutItemHeads = []
    var aboutItemDescs = []
    for (var ai = 1; ai <= 2; ai++) {
      var headEl = $about.find('[data-animation="about-item-head-' + ai + '"]')[0]
      var descEl = $about.find('[data-animation="about-item-description-' + ai + '"]')[0]

      if (headEl) {
        var headSplit = new SplitText(headEl, { type: 'lines', linesClass: 'split-line' })
        headSplit.lines.forEach(function (line) {
          var w = document.createElement('div')
          w.style.overflow = 'hidden'
          line.parentNode.insertBefore(w, line)
          w.appendChild(line)
        })
        gsap.set(headSplit.lines, { y: '100%' })
        aboutItemHeads.push(headSplit)
      }

      if (descEl) {
        var descSplit = new SplitText(descEl, { type: 'lines', linesClass: 'split-line' })
        descSplit.lines.forEach(function (line) {
          var w = document.createElement('div')
          w.style.overflow = 'hidden'
          line.parentNode.insertBefore(w, line)
          w.appendChild(line)
        })
        gsap.set(descSplit.lines, { y: '100%' })
        aboutItemDescs.push(descSplit)
      }
    }

    // 6. Footer text - split by lines, slide up
    var aboutFooter = $about.find('[data-animation="about-item-footer"]')[0]
    var aboutFooterSplit = null
    if (aboutFooter) {
      aboutFooterSplit = new SplitText(aboutFooter, { type: 'lines', linesClass: 'split-line' })
      aboutFooterSplit.lines.forEach(function (line) {
        var w = document.createElement('div')
        w.style.overflow = 'hidden'
        line.parentNode.insertBefore(w, line)
        w.appendChild(line)
      })
      gsap.set(aboutFooterSplit.lines, { y: '100%' })
    }

    // 7. Footer logos
    var aboutLogos = $about.find('[data-animation="about-item-footer-logos"] img')
    if (aboutLogos.length) gsap.set(aboutLogos, { opacity: 0, y: 20 })

    ScrollTrigger.create({
      trigger: $about[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()

        // 1. Head title
        if (aboutHead) {
          tl.to(aboutHead, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, 0)
        }

        // 2. Typewriter description
        if (aboutDescSplit) {
          tl.to(aboutDescSplit.chars, {
            keyframes: [
              { opacity: 0.4, duration: aboutSpeed * 2, ease: 'none' },
              { opacity: 1, duration: aboutSpeed * 6, ease: 'power1.out' },
            ],
            stagger: aboutSpeed,
          }, 0)
        } else if (aboutDesc && aboutDescMobile) {
          tl.to(aboutDesc, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, 0.2)
        }

        var t1 = aboutDescSplit ? aboutDescSplit.chars.length * aboutSpeed * 0.5 : 0.4

        // 3. Illustration
        if (aboutIllustration) {
          tl.to(aboutIllustration, {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          }, t1)
        }

        // 4. About head text - lines slide up, then chars color wipe left to right
        if (aboutHeadSplit) {
          if (aboutHeadMobile) {
            tl.to(aboutHeadText, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            }, t1 + 0.2)
            tl.to(aboutHeadSplit.chars, {
              color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
            }, t1 + 0.5)
          } else {
            tl.to(aboutHeadSplit.lines, {
              y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
            }, t1 + 0.2)
            tl.to(aboutHeadSplit.chars, {
              color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
            }, t1 + 0.7)
          }
        }

        var t2 = t1 + 0.8

        // 5. Item heads + descriptions
        aboutItemHeads.forEach(function (s, idx) {
          tl.to(s.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t2 + idx * 0.3)
        })

        aboutItemDescs.forEach(function (s, idx) {
          tl.to(s.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t2 + 0.15 + idx * 0.3)
        })

        // 6. Footer text
        if (aboutFooterSplit) {
          tl.to(aboutFooterSplit.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t2 + 0.6)
        }

        // 7. Footer logos
        if (aboutLogos.length) {
          tl.to(aboutLogos, {
            opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.12,
          }, t2 + 0.8)
        }
      },
    })
  }

  // Helper: split by lines with overflow wrappers (used by multiple sections)
  function splitLines(el) {
    var split = new SplitText(el, { type: 'lines', linesClass: 'split-line' })
    split.lines.forEach(function (line) {
      var w = document.createElement('div')
      w.style.overflow = 'hidden'
      line.parentNode.insertBefore(w, line)
      w.appendChild(line)
    })
    gsap.set(split.lines, { y: '100%' })
    return split
  }

  // Iceland Your Way catalogue repeats the exact featured-item contract for current harvested cards.
  // Featured section
  var $featured = $('.featured-section')

  if ($featured.length && window.gsap && window.ScrollTrigger && window.SplitText) {

    // 1. Head title
    var featuredHead = $featured.find('[data-animation="featured-head"]')[0]
    var featuredHeadSplit = null
    if (featuredHead) {
      if (window.innerWidth <= 479) {
        gsap.set(featuredHead, { opacity: 0, y: 30 })
      } else {
        featuredHeadSplit = splitLines(featuredHead)
      }
    }

    // 2. Head description
    var featuredHeadDesc = $featured.find('[data-animation="featured-head-description"]')[0]
    var featuredHeadDescSplit = null
    if (featuredHeadDesc) {
      if (window.innerWidth <= 479) {
        gsap.set(featuredHeadDesc, { opacity: 0, y: 30 })
      } else {
        featuredHeadDescSplit = splitLines(featuredHeadDesc)
      }
    }

    // 3. Prepare all featured items
    var featuredItemsData = []
    $featured.find('.featured-item').each(function () {
      var $item = $(this)
      var data = { el: this }

      // Head title
      var head = $item.find('[data-animation="featured-item-head"]')[0]
      data.headSplit = head ? splitLines(head) : null

      // Cost - fade up, no split
      data.cost = $item.find('[data-animation="featured-item-cost"]')[0]
      if (data.cost) gsap.set(data.cost, { opacity: 0, y: 20 })

      // Properties - just fade up, no split
      data.props = $item.find('[data-animation="featured-item-property"]')
      if (data.props.length) gsap.set(data.props, { opacity: 0, y: 20 })

      // Button (.btn-secondary inside featured-item-button)
      data.btn = $item.find('[data-animation="featured-item-button"] .btn-secondary')[0]
      if (data.btn) {
        data.btn.style.transition = 'none'
        gsap.set(data.btn, { scale: 0, opacity: 0, transformOrigin: 'center center' })
      }

      // Illustration - fade from left
      data.illustration = $item.find('[data-animation="featured-item-illustration"]')[0]
      if (data.illustration) gsap.set(data.illustration, { opacity: 0, x: -40 })

      // Mobile visual (.mobile-visible)
      data.mobileVisual = $item.find('.featured-item__visual.mobile-visible')[0]
      if (data.mobileVisual) gsap.set(data.mobileVisual, { opacity: 0, x: -40 })

      featuredItemsData.push(data)
    })

    // Featured decs
    // 1-4: left to right (width), 5-7: top to bottom (height)
    var featuredDecsH = []
    var featuredDecsV = []
    for (var di = 1; di <= 7; di++) {
      var dec = document.querySelector('.featured__dec--' + di)
      if (!dec) continue
      if (di <= 4) {
        gsap.set(dec, { width: '0%' })
        featuredDecsH.push(dec)
      } else {
        gsap.set(dec, { height: '0%' })
        featuredDecsV.push({ el: dec, target: di === 5 ? 'calc(100% - 2px)' : '100%' })
      }
    }

    var isFeaturedMobile = window.innerWidth <= 479

    // Helper: animate a single featured item
    function animateFeaturedItem(data, tl, startAt) {
      if (data.headSplit) {
        tl.to(data.headSplit.lines, {
          y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.08,
        }, startAt)
      }

      if (data.cost) {
        tl.to(data.cost, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        }, startAt + 0.1)
      }

      if (data.illustration) {
        tl.to(data.illustration, {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
        }, startAt + 0.1)
      }

      if (data.mobileVisual) {
        tl.to(data.mobileVisual, {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
        }, startAt + 0.1)
      }

      if (data.props.length) {
        tl.to(data.props, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        }, startAt + 0.2)
      }

      if (data.btn) {
        tl.to(data.btn, {
          scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out',
        }, startAt + 0.2 + (data.props.length * 0.08))
      }
    }

    if (isFeaturedMobile) {
      // Mobile: each item gets its own ScrollTrigger
      ScrollTrigger.create({
        trigger: $featured[0],
        start: 'top 88%',
        once: true,
        onEnter: function () {
          var tl = gsap.timeline()

          featuredDecsH.forEach(function (dec, i) {
            tl.to(dec, {
              width: '100%', duration: 0.8, ease: 'power2.inOut',
            }, i * 0.1)
          })

          var hStart = featuredDecsH.length * 0.1
          featuredDecsV.forEach(function (item, i) {
            tl.to(item.el, {
              height: item.target, duration: 0.8, ease: 'power2.inOut',
            }, hStart + i * 0.1)
          })

          if (featuredHeadSplit) {
            tl.to(featuredHeadSplit.lines, {
              y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
            }, 0)
          } else if (featuredHead) {
            tl.to(featuredHead, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            }, 0.2)
          }

          if (featuredHeadDescSplit) {
            tl.to(featuredHeadDescSplit.lines, {
              y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
            }, 0.3)
          } else if (featuredHeadDesc) {
            tl.to(featuredHeadDesc, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            }, 0.5)
          }
        },
      })

      featuredItemsData.forEach(function (data) {
        ScrollTrigger.create({
          trigger: data.el,
          start: 'top 90%',
          once: true,
          onEnter: function () {
            var tl = gsap.timeline()
            animateFeaturedItem(data, tl, 0)
          },
        })
      })
    } else {
      // Desktop: all items animate together on section enter
      ScrollTrigger.create({
        trigger: $featured[0],
        start: 'top 88%',
        once: true,
        onEnter: function () {
          var tl = gsap.timeline()
          var t = 0

          featuredDecsH.forEach(function (dec, i) {
            tl.to(dec, {
              width: '100%', duration: 0.8, ease: 'power2.inOut',
            }, i * 0.1)
          })

          var hStart = featuredDecsH.length * 0.1
          featuredDecsV.forEach(function (item, i) {
            tl.to(item.el, {
              height: item.target, duration: 0.8, ease: 'power2.inOut',
            }, hStart + i * 0.1)
          })

          if (featuredHeadSplit) {
            tl.to(featuredHeadSplit.lines, {
              y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
            }, t)
          }

          t += 0.3
          if (featuredHeadDescSplit) {
            tl.to(featuredHeadDescSplit.lines, {
              y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
            }, t)
          }

          t += 0.4
          featuredItemsData.forEach(function (data, idx) {
            animateFeaturedItem(data, tl, t + idx * 0.15)
          })
        },
      })
    }
  }

  // Iceland Your Way adds links within existing category text hooks; animation targets are unchanged.
  // Combine section
  var $combine = $('[data-animation="combine-headline"]').closest('section')

  if ($combine.length && window.gsap && window.ScrollTrigger && window.SplitText) {
    // 1-4. Headlines - split by lines, slide up
    var combineHeadline = $combine.find('[data-animation="combine-headline"]')[0]
    var combineHeadlineSplit = combineHeadline ? splitLines(combineHeadline) : null

    var combineTitles = []
    for (var ci = 1; ci <= 4; ci++) {
      var titleEl = $combine.find('[data-animation="combine-title-item-' + ci + '"]')[0]
      combineTitles.push(titleEl ? splitLines(titleEl) : null)
    }

    // 5. Description - split by lines+chars, slide up + color wipe (like about-head)
    var combineDesc = $combine.find('[data-animation="combine-description"]')[0]
    var combineDescSplit = null
    if (combineDesc) {
      combineDescSplit = new SplitText(combineDesc, { type: 'lines,words,chars', linesClass: 'split-line', charsClass: 'combine-char' })
      combineDescSplit.lines.forEach(function (line) {
        var w = document.createElement('div')
        w.style.overflow = 'hidden'
        line.parentNode.insertBefore(w, line)
        w.appendChild(line)
      })
      gsap.set(combineDescSplit.lines, { y: '100%' })
      gsap.set(combineDescSplit.chars, { color: 'rgba(255,255,255,0.4)' })
    }

    // Combine decs - horizontal (1-2: left to right)
    var combineDecsH = []
    for (var cdi = 1; cdi <= 2; cdi++) {
      var cdec = $combine.find('.combine__dec--' + cdi)[0]
      if (cdec) {
        gsap.set(cdec, { width: '0%' })
        combineDecsH.push(cdec)
      }
    }

    // Combine step decs - vertical (1-4: top to bottom)
    var combineStepDecs = []
    for (var csdi = 1; csdi <= 4; csdi++) {
      var csdec = $combine.find('.combine-step__dec--' + csdi)[0]
      if (csdec) {
        gsap.set(csdec, { height: '0%' })
        combineStepDecs.push({ el: csdec, target: csdi === 4 ? 'calc(100% - 2px)' : '100%' })
      }
    }

    // 6. Steps
    var combineSteps = []
    for (var si = 1; si <= 4; si++) {
      var stepEl = $combine.find('[data-animation="combine-step-' + si + '"]')[0]
      if (!stepEl) { combineSteps.push(null); continue }

      var headEl = stepEl.querySelector('.combine-step__head')
      var bodyEl = stepEl.querySelector('.combine-step__body .body-lg')

      var headSplit = headEl ? splitLines(headEl) : null
      var bodySplit = bodyEl ? splitLines(bodyEl) : null

      combineSteps.push({ headSplit: headSplit, bodySplit: bodySplit })
    }

    ScrollTrigger.create({
      trigger: $combine[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()
        var t = 0

        // 1. Headline
        if (combineHeadlineSplit) {
          tl.to(combineHeadlineSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t)
        }

        // 2-4. Title items
        combineTitles.forEach(function (s, idx) {
          if (s) {
            tl.to(s.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.08,
            }, t + 0.15 * (idx + 1))
          }
        })

        // Combine decs horizontal
        combineDecsH.forEach(function (dec, i) {
          tl.to(dec, {
            width: '100%', duration: 0.8, ease: 'power2.inOut',
          }, t + i * 0.1)
        })

        // 5. Description - lines slide up + chars color wipe
        t += 0.15 * 4
        if (combineDescSplit) {
          tl.to(combineDescSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t)
          tl.to(combineDescSplit.chars, {
            color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
          }, t + 0.5)
        }

        // Combine step decs vertical
        combineStepDecs.forEach(function (item, i) {
          tl.to(item.el, {
            height: item.target, duration: 0.8, ease: 'power2.inOut',
          }, t + 0.4 + i * 0.1)
        })

        // 6. Steps
        t += 0.6
        combineSteps.forEach(function (step, idx) {
          if (!step) return
          var stepStart = t + idx * 0.2

          if (step.headSplit) {
            tl.to(step.headSplit.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, stepStart)
          }

          if (step.bodySplit) {
            tl.to(step.bodySplit.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, stepStart + 0.1)
          }
        })
      },
    })
  }

  // Iceland Your Way uses sourced geographic coordinates; the same adjacent glow/circle DOM contract is retained.
  // Destination section
  var $destination = $('.destination-section')

  if ($destination.length && window.gsap && window.ScrollTrigger && window.SplitText) {
    gsap.registerPlugin(SplitText)

    // 1. Head title (fade up like about-section-head)
    var destHead = $destination.find('[data-animation="destination-head-title"]')[0]
    if (destHead) gsap.set(destHead, { opacity: 0, y: 40 })

    // 2. H2 typewriter (like about-head-description)
    var destH2 = $destination.find('[data-animation="destination-h2"]')[0]
    var destH2Split = null
    var destH2Speed = 0.03
    var destH2Mobile = window.innerWidth <= 479
    if (destH2) {
      if (destH2Mobile) {
        gsap.set(destH2, { opacity: 0, y: 30 })
      } else {
        destH2Split = new SplitText(destH2, { type: 'words,chars', charsClass: 'tw-char' })
        gsap.set(destH2Split.chars, { opacity: 0 })
      }
    }

    // 3. Description (lines+chars split, slide up + color wipe like about-head)
    var destDesc = $destination.find('[data-animation="destination-description"]')[0]
    var destDescSplit = null
    var destDescMobile = window.innerWidth <= 479
    if (destDesc) {
      if (destDescMobile) {
        // Mobile: only chars, no line wrappers
        destDescSplit = new SplitText(destDesc, { type: 'words,chars', charsClass: 'dest-char' })
        gsap.set(destDesc, { opacity: 0, y: 30 })
        gsap.set(destDescSplit.chars, { color: 'rgba(255,255,255,0.4)' })
      } else {
        var destDescHTML = destDesc.innerHTML
        destDescSplit = new SplitText(destDesc, { type: 'lines,words,chars', linesClass: 'split-line', charsClass: 'dest-char' })

        if (destDescSplit.lines.length) {
          var nbspMatch = destDescHTML.match(/^((?:&nbsp;|\xA0| )+)/)
          if (nbspMatch) {
            var spacer = document.createElement('span')
            spacer.innerHTML = nbspMatch[0]
            destDescSplit.lines[0].insertBefore(spacer, destDescSplit.lines[0].firstChild)
          }
        }

        destDescSplit.lines.forEach(function (line) {
          var wrapper = document.createElement('div')
          wrapper.style.overflow = 'hidden'
          line.parentNode.insertBefore(wrapper, line)
          wrapper.appendChild(line)
        })
        gsap.set(destDescSplit.lines, { y: '100%' })
        gsap.set(destDescSplit.chars, { color: 'rgba(255,255,255,0.4)' })
      }
    }

    // 4. Dots SVG - collect solid circles (skip glow groups, animate via opacity)
    var destDotsSvg = $destination.find('.destination__dots')[0]
    var dotPairs = []
    if (destDotsSvg) {
      // Convert to static array to avoid live collection issues
      var allChildren = Array.prototype.slice.call(destDotsSvg.querySelectorAll('.map-pin > g, .map-pin > circle:not(.map-hit)'))
      for (var di = 0; di < allChildren.length; di++) {
        var el = allChildren[di]
        var tag = el.tagName.toLowerCase()
        if (tag === 'g' && el.getAttribute('opacity')) {
          // Glow group
          var solidCircle = allChildren[di + 1]
          if (solidCircle && solidCircle.tagName.toLowerCase() === 'circle') {
            var cx = solidCircle.getAttribute('cx')
            var cy = solidCircle.getAttribute('cy')
            gsap.set(el, { scale: 0, svgOrigin: cx + ' ' + cy })
            gsap.set(solidCircle, { scale: 0, svgOrigin: cx + ' ' + cy })
            dotPairs.push({ glow: el, dot: solidCircle, cx: cx, cy: cy })
          }
        }
      }
    }

    ScrollTrigger.create({
      trigger: $destination[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()
        var t = 0

        // 1. Head title fade up
        if (destHead) {
          tl.to(destHead, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t)
        }

        // 2. H2 typewriter
        if (destH2Split) {
          tl.to(destH2Split.chars, {
            keyframes: [
              { opacity: 0.4, duration: destH2Speed * 2, ease: 'none' },
              { opacity: 1, duration: destH2Speed * 6, ease: 'power1.out' },
            ],
            stagger: destH2Speed,
          }, t + 0.2)
        } else if (destH2 && destH2Mobile) {
          tl.to(destH2, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t + 0.2)
        }

        var t1 = t + 0.2 + (destH2Split ? destH2Split.chars.length * destH2Speed * 0.5 : 0.4)

        // 3. Description - lines slide up + chars color wipe
        if (destDescSplit) {
          if (destDescMobile) {
            tl.to(destDesc, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            }, t1)
            tl.to(destDescSplit.chars, {
              color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
            }, t1 + 0.3)
          } else {
            tl.to(destDescSplit.lines, {
              y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
            }, t1)
            tl.to(destDescSplit.chars, {
              color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
            }, t1 + 0.5)
          }
        }

      },
    })

    // 4. Dots - own ScrollTrigger, fires when .destination__dots enters viewport
    if (dotPairs.length) {
      ScrollTrigger.create({
        trigger: $destination.find('.destination__dots')[0],
        start: 'top 90%',
        once: true,
        onEnter: function () {
          var tl = gsap.timeline()
          var shuffled = gsap.utils.shuffle(dotPairs.slice())
          shuffled.forEach(function (pair, idx) {
            var offset = idx * 0.08
            tl.to(pair.glow, {
              scale: 0.6, opacity: 0.15, duration: 0.6, ease: 'elastic.out(1, 0.5)',
              filter: 'blur(2px)',
            }, offset)
            tl.to(pair.dot, {
              scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)',
            }, offset)
          })

          // Pulse loop after initial appear
          tl.call(function () {
            dotPairs.forEach(function (pair) {
              var delay = Math.random() * 2
              var dur = 1 + Math.random() * 0.8
              gsap.to(pair.dot, {
                scale: 1.2, duration: dur, ease: 'sine.inOut',
                repeat: -1, yoyo: true, delay: delay,
                svgOrigin: pair.cx + ' ' + pair.cy,
              })
              gsap.to(pair.glow, {
                scale: 1.4, opacity: 0.1, duration: dur, ease: 'sine.inOut',
                repeat: -1, yoyo: true, delay: delay,
                svgOrigin: pair.cx + ' ' + pair.cy,
              })
            })
          })
        },
      })
    }

    // Mobile destination items
    if (window.innerWidth <= 479) {
      var destMobileItems = $destination.find('.destination-mobile-item')
      if (destMobileItems.length) {
        gsap.set(destMobileItems, { opacity: 0, y: 30 })
        destMobileItems.each(function (idx) {
          var el = this
          ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: function () {
              gsap.to(el, {
                opacity: 1, y: 0, duration: 0.8, delay: idx * 0.15, ease: 'power3.out',
              })
            },
          })
        })
      }
    }
  }

  // How Works section
  var $howWorks = $('.how-works-section')

  if ($howWorks.length && window.gsap && window.ScrollTrigger && window.SplitText) {
    // 1. Headline (like featured-head: splitLines slide up)
    var hwHeadline = $howWorks.find('[data-animation="how-works-headline"]')[0]
    var hwHeadlineSplit = null
    if (hwHeadline) {
      if (window.innerWidth <= 479) {
        gsap.set(hwHeadline, { opacity: 0, y: 30 })
      } else {
        hwHeadlineSplit = splitLines(hwHeadline)
      }
    }

    // 2. Description (like featured-head-description: splitLines slide up)
    var hwDesc = $howWorks.find('[data-animation="how-works-description"]')[0]
    var hwDescSplit = null
    if (hwDesc) {
      if (window.innerWidth <= 479) {
        gsap.set(hwDesc, { opacity: 0, y: 30 })
      } else {
        hwDescSplit = splitLines(hwDesc)
      }
    }

    // 3. Items by class
    var hwItems = []
    var hwMobile = window.innerWidth <= 479
    $howWorks.find('.how-works-item').each(function () {
      var itemEl = this
      var headEl = itemEl.querySelector('.how-works-item__head')
      var titleEl = itemEl.querySelector('.how-works-item__body .body-md:not(.color-white-50)')
      var descEl = itemEl.querySelector('.how-works-item__body .body-md.color-white-50')

      var item = {}
      item.head = headEl
      if (headEl) gsap.set(headEl, { opacity: 0, y: 30 })

      if (hwMobile) {
        item.title = titleEl
        item.desc = descEl
        if (titleEl) gsap.set(titleEl, { opacity: 0, y: 30 })
        if (descEl) gsap.set(descEl, { opacity: 0, y: 30 })
      } else {
        item.titleSplit = titleEl ? splitLines(titleEl) : null
        item.descSplit = descEl ? splitLines(descEl) : null
      }

      hwItems.push(item)
    })

    ScrollTrigger.create({
      trigger: $howWorks[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()
        var t = 0

        // 1. Headline
        if (hwHeadlineSplit) {
          tl.to(hwHeadlineSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t)
        } else if (hwHeadline) {
          tl.to(hwHeadline, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t + 0.2)
        }

        // 2. Description
        t += 0.3
        if (hwDescSplit) {
          tl.to(hwDescSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t)
        } else if (hwDesc) {
          tl.to(hwDesc, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t + 0.2)
        }

        // 3. Items sequentially
        t += 0.4
        hwItems.forEach(function (item, idx) {
          if (!item) return
          var itemStart = t + idx * 0.2

          // Head always uses simple opacity/y (contains icon + count, not text)
          if (item.head) {
            tl.to(item.head, {
              opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            }, itemStart)
          }

          if (hwMobile) {
            if (item.title) {
              tl.to(item.title, {
                opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
              }, itemStart + 0.1)
            }
            if (item.desc) {
              tl.to(item.desc, {
                opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
              }, itemStart + 0.2)
            }
          } else {
            if (item.titleSplit) {
              tl.to(item.titleSplit.lines, {
                y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
              }, itemStart + 0.1)
            }

            if (item.descSplit) {
              tl.to(item.descSplit.lines, {
                y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
              }, itemStart + 0.2)
            }
          }
        })
      },
    })
  }

  // Practitioners section
  var $practitioners = $('.practitioners-section')

  if ($practitioners.length && window.gsap && window.ScrollTrigger && window.SplitText) {

    // Persons 1-4: illustration fade from left, title + description slide up
    var practPersons = []
    for (var pi = 1; pi <= ($practitioners.find('[data-animation="practitioners-illustration-6"]').length ? 6 : 4); pi++) {
      var $personList = $practitioners.find('.practitioners__list.' + (window.innerWidth <= 479 ? 'mobile-visible' : 'mobile-hidden'))
      var illEl = $personList.find('[data-animation="practitioners-illustration-' + pi + '"]')[0]
      var pTitle = $personList.find('[data-animation="practitioners-person-title-' + pi + '"]')[0]
      var pDesc = $personList.find('[data-animation="practitioners-person-description-' + pi + '"]')[0]

      if (illEl) gsap.set(illEl, { opacity: 0, x: -40 })
      var pTitleSplit = pTitle ? splitLines(pTitle) : null
      var pDescSplit = pDesc ? splitLines(pDesc) : null

      practPersons.push({ visual: illEl, titleSplit: pTitleSplit, descSplit: pDescSplit })
    }

    // Title (fade up like about-section-head)
    var practTitle = $practitioners.find('[data-animation="practitioners-title"]')[0]
    if (practTitle) gsap.set(practTitle, { opacity: 0, y: 40 })

    // Headline (splitLines like featured-head)
    var practMobile = window.innerWidth <= 479
    var practHeadline = $practitioners.find('[data-animation="practitioners-headline"]')[0]
    var practHeadlineSplit = null
    if (practHeadline) {
      if (practMobile) {
        gsap.set(practHeadline, { opacity: 0, y: 30 })
      } else {
        practHeadlineSplit = splitLines(practHeadline)
      }
    }

    // Plus icons (rotate 180)
    var practPluses = []
    for (var pli = 1; pli <= 2; pli++) {
      var plusEl = $practitioners.find('[data-animation="practitioners-plus-' + pli + '"]')[0]
      if (plusEl) {
        gsap.set(plusEl, { rotation: -180, opacity: 0 })
        practPluses.push(plusEl)
      }
    }

    // Item titles (splitLines like featured-head)
    var practItemTitle1 = $practitioners.find('[data-animation="practitioners-item-title-1"]')[0]
    var practItemTitle1Split = null
    if (practItemTitle1) {
      if (practMobile) {
        gsap.set(practItemTitle1, { opacity: 0, y: 30 })
      } else {
        practItemTitle1Split = splitLines(practItemTitle1)
      }
    }

    // Item descriptions (splitLines like featured-head)
    var practItemDesc1 = $practitioners.find('[data-animation="practitioners-item-description-1"]')[0]
    var practItemDesc1Split = null
    if (practItemDesc1) {
      if (practMobile) {
        gsap.set(practItemDesc1, { opacity: 0, y: 30 })
      } else {
        practItemDesc1Split = splitLines(practItemDesc1)
      }
    }

    // Item description 2 (lines+chars like about-head: slide up + color wipe)
    var practItemDesc2 = $practitioners.find('[data-animation="practitioners-item-description-2"]')[0]
    var practItemDesc2Split = null
    if (practItemDesc2) {
      if (practMobile) {
        gsap.set(practItemDesc2, { opacity: 0, y: 30 })
      } else {
        practItemDesc2Split = new SplitText(practItemDesc2, { type: 'lines,words,chars', linesClass: 'split-line', charsClass: 'pract-char' })
        practItemDesc2Split.lines.forEach(function (line) {
          var wrapper = document.createElement('div')
          wrapper.style.overflow = 'hidden'
          line.parentNode.insertBefore(wrapper, line)
          wrapper.appendChild(line)
        })
        gsap.set(practItemDesc2Split.lines, { y: '100%' })
        gsap.set(practItemDesc2Split.chars, { color: 'rgba(255,255,255,0.4)' })
      }
    }

    // Practitioners decs
    // 1,2,5: left to right (width), 4,3: top to bottom (height)
    var practDec1 = $practitioners.find('.practitioners__dec--1')[0]
    var practDec2 = $practitioners.find('.practitioners__dec--2')[0]
    var practDec4 = $practitioners.find('.practitioners__dec--4')[0]
    var practDec5 = $practitioners.find('.practitioners__dec--5')[0]
    var practDec3 = $practitioners.find('.practitioners__dec--3')[0]

    if (!practMobile) {
      if (practDec1) gsap.set(practDec1, { width: '0%' })
      if (practDec2) gsap.set(practDec2, { width: '0%' })
      if (practDec4) gsap.set(practDec4, { height: '0%' })
      if (practDec5) gsap.set(practDec5, { width: '0%' })
      if (practDec3) gsap.set(practDec3, { height: '0%' })
    }

    ScrollTrigger.create({
      trigger: $practitioners[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()
        var t = 0

        // Persons sequentially
        practPersons.forEach(function (person, idx) {
          var pStart = t + idx * 0.2

          if (person.visual) {
            tl.to(person.visual, {
              opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
            }, pStart)
          }

          if (person.titleSplit) {
            tl.to(person.titleSplit.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, pStart + 0.15)
          }

          if (person.descSplit) {
            tl.to(person.descSplit.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, pStart + 0.25)
          }
        })

        // Title (fade up)
        var t1 = t + practPersons.length * 0.2 + 0.3
        if (practTitle) {
          tl.to(practTitle, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t1)
        }

        // Headline (slide up)
        t1 += 0.2
        if (practHeadlineSplit) {
          tl.to(practHeadlineSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t1)
        } else if (practHeadline && practMobile) {
          tl.to(practHeadline, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t1 + 0.2)
        }

        // Plus 1 + item title 1 + item description 1
        t1 += 0.4
        if (practPluses[0]) {
          tl.to(practPluses[0], {
            rotation: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          }, t1)
        }

        if (practItemTitle1Split) {
          tl.to(practItemTitle1Split.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t1 + 0.1)
        } else if (practItemTitle1 && practMobile) {
          tl.to(practItemTitle1, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          }, t1 + 0.1)
        }

        if (practItemDesc1Split) {
          tl.to(practItemDesc1Split.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t1 + 0.2)
        } else if (practItemDesc1 && practMobile) {
          tl.to(practItemDesc1, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          }, t1 + 0.2)
        }

        // Plus 2 + item description 2 (color wipe)
        t1 += 0.5
        if (practPluses[1]) {
          tl.to(practPluses[1], {
            rotation: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          }, t1)
        }

        if (practItemDesc2Split) {
          tl.to(practItemDesc2Split.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t1 + 0.1)
          tl.to(practItemDesc2Split.chars, {
            color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
          }, t1 + 0.6)
        } else if (practItemDesc2 && practMobile) {
          tl.to(practItemDesc2, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t1 + 0.1)
        }

        // Practitioners decs sequentially (desktop only)
        if (!practMobile) {
          var dStart = 0
          if (practDec1) {
            tl.to(practDec1, {
              width: '100%', duration: 0.8, ease: 'power2.inOut',
            }, dStart)
          }
          if (practDec2) {
            tl.to(practDec2, {
              width: '100%', duration: 0.8, ease: 'power2.inOut',
            }, dStart + 0.1)
          }
          if (practDec4) {
            tl.to(practDec4, {
              height: '100%', duration: 0.8, ease: 'power2.inOut',
            }, dStart + 0.2)
          }
          if (practDec5) {
            tl.to(practDec5, {
              width: '100%', duration: 0.8, ease: 'power2.inOut',
            }, dStart + 0.3)
          }
          if (practDec3) {
            tl.to(practDec3, {
              height: '100%', duration: 0.8, ease: 'power2.inOut',
            }, dStart + 0.4)
          }
        }
      },
    })
  }

  // Footer section
  var $footer = $('.footer')

  if ($footer.length && window.gsap && window.ScrollTrigger && window.SplitText) {

    // Visual (fade from left like about-illustration)
    var footerIll = $footer.find('.footer__visual')[0]
    if (footerIll) gsap.set(footerIll, { opacity: 0, x: -40 })

    // Footer logo (slide up)
    var footerLogo = $footer.find('.footer-logo')[0]
    if (footerLogo) gsap.set(footerLogo, { opacity: 0, y: 40 })

    // Links .footer-top__link .h3 (splitLines)
    var footerLinkSplits = []
    $footer.find('.footer-top__link .h3').each(function () {
      footerLinkSplits.push(splitLines(this))
    })

    // Contacts .footer-top__contact .body-lg (splitLines)
    var footerContactSplits = []
    $footer.find('.footer-top__contact .body-lg').each(function () {
      footerContactSplits.push(splitLines(this))
    })

    // Copy .footer__copy .button-sm (splitLines)
    var footerMobile = window.innerWidth <= 479
    var footerCopy = $footer.find('.footer__copy .button-sm')[0]
    var footerCopySplit = null
    if (footerCopy) {
      if (footerMobile) {
        gsap.set(footerCopy, { opacity: 0, y: 30 })
      } else {
        footerCopySplit = splitLines(footerCopy)
      }
    }

    // Bottom links .footer-bottom__link .button-sm (splitLines)
    var footerBottomSplits = []
    var footerBottomEls = []
    $footer.find('.footer-bottom__link .button-sm').each(function () {
      if (footerMobile) {
        gsap.set(this, { opacity: 0, y: 30 })
        footerBottomEls.push(this)
      } else {
        footerBottomSplits.push(splitLines(this))
      }
    })

    // Made by
    var footerMadeBy = footerMobile
      ? $footer.find('.footer-made-by.mobile-visible')[0]
      : $footer.find('.footer-made-by.mobile-hidden')[0]
    if (footerMadeBy) gsap.set(footerMadeBy, { opacity: 0, y: 20 })

    // Footer decs
    var footerBottomDec = $footer.find('.footer-bottom__dec')[0]
    var footerCopyDec = $footer.find('.footer__copy-dec')[0]
    if (footerBottomDec && !footerMobile) gsap.set(footerBottomDec, { width: '0%' })
    if (footerCopyDec && !footerMobile) gsap.set(footerCopyDec, { height: '0%' })

    ScrollTrigger.create({
      trigger: $footer[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()
        var t = 0

        // Illustration
        if (footerIll) {
          tl.to(footerIll, {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          }, t)
        }

        // Logo
        t += 0.2
        if (footerLogo) {
          tl.to(footerLogo, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          }, t)
        }

        // Links
        t += 0.2
        footerLinkSplits.forEach(function (s, idx) {
          tl.to(s.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t + idx * 0.1)
        })

        // Contacts
        t += 0.3
        footerContactSplits.forEach(function (s, idx) {
          tl.to(s.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t + idx * 0.1)
        })

        // Copy
        t += 0.3
        if (footerCopySplit) {
          tl.to(footerCopySplit.lines, {
            y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
          }, t)
        } else if (footerCopy && footerMobile) {
          tl.to(footerCopy, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          }, t)
        }

        // Made by
        t += 0.1
        if (footerMadeBy) {
          tl.to(footerMadeBy, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          }, t)
        }

        // Bottom links
        t += 0.15
        if (footerBottomSplits.length) {
          footerBottomSplits.forEach(function (s, idx) {
            tl.to(s.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, t + idx * 0.1)
          })
        } else if (footerBottomEls.length) {
          footerBottomEls.forEach(function (el, idx) {
            tl.to(el, {
              opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            }, t + idx * 0.1)
          })
        }

        // Footer decs
        if (footerBottomDec && !footerMobile) {
          tl.to(footerBottomDec, {
            width: '100%', duration: 0.8, ease: 'power2.inOut',
          }, t + 0.1)
        }
        if (footerCopyDec && !footerMobile) {
          tl.to(footerCopyDec, {
            height: '100%', duration: 0.8, ease: 'power2.inOut',
          }, t + 0.2)
        }
      },
    })
  }

  // Retreat page - pin sidebar info
  var $retreatInfo = $('.retreat-page-info')
  var $retreatContent = $('.retreat-page-content__in')

  if ($retreatContent.length && window.gsap && window.ScrollTrigger) {
    var headerH = $('.header').outerHeight() || 0

    if (window.innerWidth <= 479) {
      // Mobile: pin the mobile nav at header height
      var $retreatMobileNav = $('.retreat-page-info__nav.mobile-visible')
      if ($retreatMobileNav.length) {
        $retreatMobileNav.css({ position: 'sticky', top: headerH + 'px', zIndex: 10 })
      }
    } else {
      // Desktop: pin the sidebar
      if ($retreatInfo.length) {
        ScrollTrigger.create({
          trigger: $retreatContent[0],
          pin: $retreatInfo[0],
          start: 'top ' + headerH,
          end: function () {
            return '+=' + ($retreatContent.outerHeight() - $retreatInfo.outerHeight())
          },
          pinSpacing: false,
        })
      }
    }
  }

  // Iceland Your Way retains content/sidebar/gallery classes; source prose and chips share this arrival. Inclusion control is functional in runtime/iyw.js, including reduced motion.
  // Retreat page - fade in up
  if (window.gsap) {
    var retreatFadeEls = [
      '.retreat-page-intro__head .breadcrumbs',
      '.retreat-page-intro__head .h2',
      '.retreat-page-intro__photos',
      '.retreat-page-content__description'
    ]
    var retreatDelay = 0
    retreatFadeEls.forEach(function (sel) {
      var el = document.querySelector(sel)
      if (el) {
        gsap.set(el, { opacity: 0, y: 30 })
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.8, delay: retreatDelay, ease: 'power3.out',
        })
        retreatDelay += 0.15
      }
    })
  }

  // Coaches page
  var $coachesPage = $('[data-anim="coaches-page-title"]').closest('section')

  if ($coachesPage.length && window.gsap && window.ScrollTrigger && window.SplitText) {
    // 1. Title (fade up like statistic-head-title)
    var coachesTitle = $coachesPage.find('[data-anim="coaches-page-title"]')[0]
    if (coachesTitle) gsap.set(coachesTitle, { opacity: 0, y: 40 })

    // 2. Headline (typewriter like statistic-h2)
    var coachesMobile = window.innerWidth <= 479
    var coachesHeadline = $coachesPage.find('[data-anim="coaches-page-headline"]')[0]
    var coachesHeadlineSplit = null
    var coachesSpeed = 0.03
    if (coachesHeadline) {
      if (coachesMobile) {
        gsap.set(coachesHeadline, { opacity: 0, y: 30 })
      } else {
        coachesHeadlineSplit = new SplitText(coachesHeadline, { type: 'words,chars', charsClass: 'tw-char' })
        gsap.set(coachesHeadlineSplit.chars, { opacity: 0 })
      }
    }

    // 3. Description (lines+chars like combine-description: slide up + color wipe)
    var coachesDesc = $coachesPage.find('[data-anim="coaches-page-description"]')[0]
    var coachesDescSplit = null
    if (coachesDesc) {
      if (coachesMobile) {
        gsap.set(coachesDesc, { opacity: 0, y: 30 })
      } else {
        coachesDescSplit = new SplitText(coachesDesc, { type: 'lines,words,chars', linesClass: 'split-line', charsClass: 'coaches-char' })
        coachesDescSplit.lines.forEach(function (line) {
          var w = document.createElement('div')
          w.style.overflow = 'hidden'
          line.parentNode.insertBefore(w, line)
          w.appendChild(line)
        })
        gsap.set(coachesDescSplit.lines, { y: '100%' })
        gsap.set(coachesDescSplit.chars, { color: 'rgba(255,255,255,0.4)' })
      }
    }

    ScrollTrigger.create({
      trigger: $coachesPage[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()

        // 1. Title
        if (coachesTitle) {
          tl.to(coachesTitle, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, 0)
        }

        // 2. Headline typewriter
        if (coachesHeadlineSplit) {
          tl.to(coachesHeadlineSplit.chars, {
            keyframes: [
              { opacity: 0.4, duration: coachesSpeed * 2, ease: 'none' },
              { opacity: 1, duration: coachesSpeed * 6, ease: 'power1.out' },
            ],
            stagger: coachesSpeed,
          }, 0)
        } else if (coachesHeadline && coachesMobile) {
          tl.to(coachesHeadline, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, 0.2)
        }

        var t1 = coachesHeadlineSplit ? coachesHeadlineSplit.chars.length * coachesSpeed * 0.5 : 0.4

        // 3. Description - lines slide up + chars color wipe
        if (coachesDescSplit) {
          tl.to(coachesDescSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t1)
          tl.to(coachesDescSplit.chars, {
            color: 'rgba(255,255,255,1)', duration: 0.08, ease: 'none', stagger: 0.008,
          }, t1 + 0.5)
        } else if (coachesDesc && coachesMobile) {
          tl.to(coachesDesc, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t1)
        }
      },
    })

    // 4. Coaches persons - each with own ScrollTrigger, staggered items
    var $coachesPersons = $coachesPage.find('.coaches-person')
    $coachesPersons.each(function (idx) {
      var $person = $(this)

      // Visual (fade from left like practitioners-illustration)
      var visual = $person.find('.coaches-person__visual')[0]
      if (visual) gsap.set(visual, { opacity: 0, x: -40 })

      // Head title (splitLines like practitioners-person-title)
      var headTitle = $person.find('.coaches-person__head .body-lg')[0]
      var headTitleSplit = null
      if (headTitle) {
        if (window.innerWidth <= 479) {
          gsap.set(headTitle, { opacity: 0, y: 30 })
        } else {
          headTitleSplit = splitLines(headTitle)
        }
      }

      // Head subtitle (splitLines like practitioners-person-description)
      var headSub = $person.find('.coaches-person__head .body-sm')[0]
      var headSubSplit = null
      if (headSub) {
        if (window.innerWidth <= 479) {
          gsap.set(headSub, { opacity: 0, y: 30 })
        } else {
          headSubSplit = splitLines(headSub)
        }
      }

      var personDelay = window.innerWidth <= 479 ? 0.15 : (idx % 3) * 0.15

      ScrollTrigger.create({
        trigger: this,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          var tl = gsap.timeline({ delay: personDelay })

          if (visual) {
            tl.to(visual, {
              opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
            }, 0)
          }

          if (headTitleSplit) {
            tl.to(headTitleSplit.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, 0.15)
          } else if (headTitle) {
            tl.to(headTitle, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.15)
          }

          if (headSubSplit) {
            tl.to(headSubSplit.lines, {
              y: '0%', duration: 0.7, ease: 'power3.out', stagger: 0.06,
            }, 0.25)
          } else if (headSub) {
            tl.to(headSub, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.25)
          }
        },
      })
    })
  }

  // Contacts page
  var $contactsSection = $('[data-anim="contacts-head"]').closest('.contact-us')
  if (!$contactsSection.length) $contactsSection = $('.contact-us')

  if ($contactsSection.length && window.gsap && window.ScrollTrigger && window.SplitText) {
    // Visual (fade from left like statistic-item-illustration)
    var contactsVisual = $contactsSection.find('.contact-us__visual')[0]
    if (contactsVisual) gsap.set(contactsVisual, { opacity: 0, x: -40 })

    // Head (fade up like statistic-head-title)
    var contactsHead = $contactsSection.find('[data-anim="contacts-head"]')[0]
    if (contactsHead) gsap.set(contactsHead, { opacity: 0, y: 40 })

    // Title (splitLines like featured-head)
    var contactsTitle = $contactsSection.find('[data-anim="contacts-title"]')[0]
    var contactsTitleSplit = contactsTitle ? splitLines(contactsTitle) : null

    // Description (splitLines like featured-head)
    var contactsDesc = $contactsSection.find('[data-anim="contacts-description"]')[0]
    var contactsDescSplit = contactsDesc ? splitLines(contactsDesc) : null

    // Form (fade in up)
    var contactsForm = $contactsSection.find('[data-anim="contacts-form"]')[0]
    if (contactsForm) gsap.set(contactsForm, { opacity: 0, y: 30 })

    // Decs
    var contactsMobile = window.innerWidth <= 479
    var contactsDec1 = !contactsMobile ? $contactsSection.find('.contact-us__dec--1')[0] : null
    var contactsDec2 = !contactsMobile ? $contactsSection.find('.contact-us__dec--2')[0] : null
    if (contactsDec1) gsap.set(contactsDec1, { height: '0%' })
    if (contactsDec2) gsap.set(contactsDec2, { width: '0%' })

    ScrollTrigger.create({
      trigger: $contactsSection[0],
      start: 'top 88%',
      once: true,
      onEnter: function () {
        var tl = gsap.timeline()
        var t = 0

        // Visual
        if (contactsVisual) {
          tl.to(contactsVisual, {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          }, t)
        }

        // Head
        if (contactsHead) {
          tl.to(contactsHead, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t)
        }

        // Title
        t += 0.2
        if (contactsTitleSplit) {
          tl.to(contactsTitleSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t)
        }

        // Description
        t += 0.3
        if (contactsDescSplit) {
          tl.to(contactsDescSplit.lines, {
            y: '0%', duration: 0.8, ease: 'power3.out', stagger: 0.08,
          }, t)
        }

        // Form
        t += 0.3
        if (contactsForm) {
          tl.to(contactsForm, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          }, t)
        }

        // Decs
        if (contactsDec1) {
          tl.to(contactsDec1, {
            height: '100%', duration: 0.8, ease: 'power2.inOut',
          }, 0.4)
        }
        if (contactsDec2) {
          tl.to(contactsDec2, {
            width: '100%', duration: 0.8, ease: 'power2.inOut',
          }, 0.1)
        }
      },
    })
  }

  // Legal page - pin nav
  var $legalNav = $('.legal-nav')
  var $legalText = $('.legal-content__text')

  if ($legalText.length && window.gsap && window.ScrollTrigger) {
    var legalHeaderH = $('.header').outerHeight() || 0
    if (window.innerWidth > 479) {
      if ($legalNav.length) {
        var sidebarPadTop = parseFloat($legalNav.closest('.legal-content__sidebar').css('padding-top')) || 0
        ScrollTrigger.create({
          trigger: $legalText[0],
          pin: $legalNav[0],
          start: 'top ' + (legalHeaderH + sidebarPadTop),
          end: function () {
            return 'bottom ' + ($legalNav.outerHeight() + legalHeaderH + sidebarPadTop)
          },
          pinSpacing: false,
        })
      }
    }
  }
})
