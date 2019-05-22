cssVars()

let computedStyle = function (vElement) {
	return window.getComputedStyle ? window.getComputedStyle(vElement, null) : vElement.currentStyle //IE 8 and less
}
let isVisible = function (vElement) {
	return !(vElement.offsetWidth == 0 && vElement.offsetHeight == 0) && computedStyle(vElement).visibility != "hidden"
}

function getAbsoluteHeight(el) {
	// Get the DOM Node if you pass in a string
	el = (typeof el === 'string') ? document.querySelector(el) : el

	var styles = window.getComputedStyle(el)
	var margin = parseFloat(styles['marginTop']) +
		parseFloat(styles['marginBottom'])

	return Math.ceil(el.offsetHeight + margin)
}
// --------------------------------------------------
//      Переменная высоты шапки в css переменную
// --------------------------------------------------
let mainHead,
		headerHeight = document.getElementsByTagName('header')[0].getBoundingClientRect().height

document.documentElement.style.setProperty('--headerHeight', headerHeight + 'px')

const mainHeadElements = document.querySelectorAll('.main-head')
Array.from(mainHeadElements).forEach(el => {
	if (isVisible(el)) {
		mainHead = getAbsoluteHeight(el)
	}
})

$(document).ready(function () {
	jQuery.fn.exists = function () {
		return $(this).length
	}

	// --------------------------------------------------
	//                Отслеживание событий
	// --------------------------------------------------
	// Эмуляция переходов по страницам. Подобие роутинга в Angular
	$('a').click(function (e) {
		e.preventDefault()
		// e.stopPropagation()
		// Получаем id текущей страницы
		let currentPage = $('[id^="jq-page-"].is-active').attr('id')
		let href = $(this).attr('href')

		// Если есть атрибутт disabled - ничего не делаем
		// или
		// Если href не указан, значит это обычная ссылка - ничего не делаем
		if ($(this).attr('disabled') || href === '#' || href.indexOf('tab-') === 1) return

		// Скрываем все страницы
		$('[id^="jq-page-"]').removeClass('is-active')

		// Найдем на открыв. странице кнопку назад
		// если она есть, изменим ей ссылку
		// console.log(currentPage)
		
		if ( $(href).find('.link-go').exists() ) {
			$(href).find('.main-head .link-go').attr('href', '#' + currentPage)
		}

		// Открываем нужную страницу, указанную в href ссылки
		$(href).addClass('is-active')
		$('.navbar-nav .list dd').removeClass('is-active')
		$('a[href="'+ href +'"]').closest('dd').addClass('is-active')


		// Синицилизировать плагин троеточия
		if ( $(href).find(".jq-dotsMore:visible").exists()) {
			shaveInit()
		}
		selectStylerInit()
	})

	// --------------------------------------------------
	//    Ввод только числовых значений в поле ввода
	// --------------------------------------------------
	$(document).on('change keyup input click', '.counter input', function (e) {
		if (this.value.match(/[^0-9]/g)) {
			this.value = this.value.replace(/[^0-9]/g, '')
		}
	})

	// --------------------------------------------------
	//                     Counter
	// --------------------------------------------------
	$('.counter').each(function () {
		const $this = $(this)
		const tip = $this.find('.counter-field-text')

		$this.find('.counter-control').click(function () {
			const handle = $(this)
			const val = parseInt($this.find('input').val())

			if (handle.hasClass('minus')) {
				// Если кликаем по минусу
				if (val > 0) {
					$this.find('input').val(parseInt(val) - 1)
				}

				if (!val || val === 1) {
					$this.find('input').val('1')
				}
				return false
			} else if (handle.hasClass('plus')) {
				// Если кликаем по плюсу
				if (!val) {
					$this.find('input').val('1')
					return false
				}
				$this.find('input').val(parseInt(val) + 1)
				return false
			}
		})
	})

	// --------------------------------------------------
	//                Переключение табов
	// --------------------------------------------------
	$(".tabs-nav ul li a").click(function (e) {
		e.preventDefault()
		let linksAttr = $(this).attr("href")

		let parentTabs = $(this).closest(".tabs")
		let activeTab = $(this).parents("li")
		let activeContent = parentTabs.find(linksAttr)

		parentTabs.find(".tabs-nav:first ul li").removeClass("is-active")
		activeTab.addClass("is-active")

		$(".tabs-content>div").hide().addClass("is-hidden").removeClass("is-visible")
		parentTabs.find(".tabs-content:first > div").hide().addClass("is-hidden").removeClass("is-visible")
		activeContent.fadeIn('300')

		setTimeout(() => {
			activeContent.removeClass("is-hidden").addClass("is-visible")
		}, 0)
	})

	// --------------------------------------------------
	//            Удаление товаров в корзине
	// --------------------------------------------------
	$(document).stop(true).on('click', '.jq-cartRemoveItem', function (e) {
		e.preventDefault()
		const card = $(this).closest('.card')
		card.fadeOut()
	})
	
	// --------------------------------------------------
	//   TriggerHandler в елементах списка сообщений
	// --------------------------------------------------
	$(document).stop(true).on('click', '.message-list .item *:not(.link)', function (e) {
		e.preventDefault()
		const item = $(this).closest('.item')
		item.find('.item-title-text .link').triggerHandler('click')
		e.stopPropagation()
		return false
	})

	// --------------------------------------------------
	// Обработка открытия/закрытия боковой панели (справа)
	// --------------------------------------------------
	$(document).stop(true).on('click', '.jq-togglePanel', function (e) {
		e.preventDefault()
		const panel = $(this).closest('.panel')
		const dataPanel = $(this).attr('data-panel')
		const aside = panel.hasClass('panel-aside') || $(this).attr('data-target') === 'aside'
		const action = $(this).attr('data-action')
		togglePanel(aside, action)
		console.log(dataPanel)
		if (dataPanel) {
			$('.page-aside .panel').hide()
			$('#' + dataPanel).show()
		}
	})

	function togglePanel(aside, action) {
		const className = aside ? 'panel-aside-open' : 'panel-open'
		if (action === 'open') {
			$('.page').addClass(className)
		} else if (action === 'close') {
			$('.page').removeClass(className)
		}
	}

	// --------------------------------------------------
	// Обработка открытия/закрытия боковой панели (слева)
	// --------------------------------------------------
	$(document).stop(true).on('click', '.jq-toggleNavbar', function (e) {
		e.preventDefault()
		if ($('.page').hasClass('panel-open')) {
			$('.page').removeClass('panel-open')
			setTimeout(() => {
				$('.page').toggleClass('navbar-is-open')
			}, 250)
		} else {
			$('.page').toggleClass('navbar-is-open')
		}
	})

	// --------------------------------------------------
	//         Смена текста (toggle) на кнопке
	// --------------------------------------------------
	$('body').on('click', '.jq-addToCart', function (e) {
		e.preventDefault()
		const $this = $(this)
		const tipText = $this.text()
		const tipToggleText = $this.attr('data-toggle-text')

		$this.text(tipToggleText).attr('data-toggle-text', tipText)
		$this.removeClass('btn-green').addClass('btn-red')
		$('.jq-counterAnimate').addClass('animate')
		setTimeout(function () {
			$('.jq-counterAnimate').removeClass('animate')
		}, 400)
	})
	
	// --------------------------------------------------
	//   Обработка эффекта radio (выбора) для плитки
	// --------------------------------------------------
	$(document).stop(true).on('click', '.tiles .tile', function (e) {
		e.preventDefault()
		$(this).closest('.tiles').find('.tile').removeClass('is-active')
		$(this).addClass('is-active')
	})

	// --------------------------------------------------
	//               Обработка выбора кнопки
	// --------------------------------------------------
	$(document).stop(true).on('click', '.jq-btnSelect', function (e) {
		e.preventDefault()
		$(this).addClass('is-selected')
	})

	// --------------------------------------------------
	//    Отслеживание прокрутки контент части сайта
	// --------------------------------------------------
	document.querySelector('.page-content .baron__scroller').addEventListener('scroll', function () {
		if ($('.jq-sticky').exists() && Sticky) {
			Sticky.refresh()
		}

		if (this.scrollTop > 0) {
			$(this).find('.header').addClass('is-fixed')
		} else {
			$(this).find('.header').removeClass('is-fixed')
		}
	})

	// --------------------------------------------------
	//       Подгрузка скрытых блоков (новости)
	// --------------------------------------------------
	$('body').on('click', '.jq-viewMore', function (e) {
		e.preventDefault()
		const $this = $(this)
		const $grids = $this.closest('.grids')
		const $btnMore = $this.closest('.btn-more')
		const isHidden = $grids.find('.is-hidden').exists()
		const countView = 4

		if (isHidden > 0 && isHidden > countView) {
			$btnMore.appendTo($grids)
		} else {
			$btnMore.hide()
		}
		if ($grids.exists()) {
			$grids.find('.is-hidden:lt(' + countView + ')').removeClass('is-hidden').addClass('is-visible')
		}
	})

	// --------------------------------------------------
	//           Подключение inline-плагинов
	// --------------------------------------------------

	/* --- Стилизация скролла ---*/
	let scroller
	$('.baron').each(function () {
		scroller = baron({
			root: this,
			scroller: '.baron__scroller',
			bar: '.baron__bar'
		})
	})

	/* --- Функция сокращения текста точками ---*/
	function shaveInit() {
		$('.jq-dotsMore:visible').each(function() {
			const maxHeight = $(this).closest('div').height() + 1
			$(this).shave(maxHeight)
		})
	}

	if ($(".jq-dotsMore:visible").exists()) {
		shaveInit()
	}

	/* --- Иннициализация datepicker ---*/
	if ($(".jq-datepicker").exists()) {
		$('.jq-datepicker').datepicker({
			autoClose: true,
		})
	}

	/* --- Запрет на перетаскивание картинок и ссылок ---*/
	$("img, a").on("dragstart", function (event) {
		event.preventDefault()
	})

	// Статус проверки телефона
	let phoneValid = false
	if ($('input[type=tel]').exists()) {
		// Подключение плагина для маски телефона
		$("input[type=tel]").mask("+7 (999) 999-99-99", {
			showMaskOnFocus: true,
			showMaskOnHover: false,
			autoclear: false,
			completed: function () {
				// При полном вводе телефона меняем статус на true и удаляем классы для ошибок
				phoneValid = true
				$(this).removeClass('invalid')
				$(this).closest('.form-group').removeClass('has-error')
			}
		})
	}

	/* --- Функция фиксирования блока при прокрутке ---*/
	var Sticky = new hcSticky('.jq-sticky', {
		top: headerHeight + 16,
		onStart: function(el) {
			console.log($(this).css('top', el.top))
			console.log('start')
		}
	})

	/* --- select jqStyler ---*/
	function selectStylerInit() {
		if ($('.jq-select:visible').exists()) {
			$('.jq-select:visible').styler()
		}
	}
	selectStylerInit()

	/* --- beefup accordion ---*/
	if ($('.beefup').exists()) {
		$('.beefup').beefup({
			animation: 'fade',
			openSpeed: 0,
    	closeSpeed: 0
		})
	}

	var clipboard = new ClipboardJS('[data-clipboard-text]');

	clipboard.on('success', function (e) {
		// console.info('Action:', e.action);
		// console.info('Text:', e.text);
		// console.info('Trigger:', e.trigger);
		if ($(e.trigger).hasClass('tile')) {
			$(e.trigger).addClass('is-copied')
			setTimeout(() => {
				$(e.trigger).removeClass('is-copied')
			}, 2000)
		}
		e.clearSelection();
	});


	
	// --------------------------------------------------
	//   Проверка разрешения и изменения размера экрана
	// --------------------------------------------------
	function checkResizing() {
		let mediaQuery = document.body.clientWidth

		if (mediaQuery <= 767) {
			// console.log('set phone js')
		}
	}
	checkResizing()

	/* --- при изменении размеров окна ---*/
	$(window).resize(function () {
		checkResizing()
	})

	/* --- при смене ориентации ---*/
	window.addEventListener("orientationchange", function () {
		checkResizing()
	}, false)
})