cssVars()

const cssFix = function () {
	const u = navigator.userAgent.toLowerCase(),
		is = function (t) {
			return (u.indexOf(t) != -1)
		};
	$("html").addClass([
		(!(/opera|webtv/i.test(u)) && /msie (\d)/.test(u)) ? ('ie ie' + RegExp.$1) :
		is('firefox/2') ? 'gecko ff2' :
		is('firefox/3') ? 'gecko ff3' :
		is('gecko/') ? 'gecko' :
		is('opera/9') ? 'opera opera9' : /opera (\d)/.test(u) ? 'opera opera' + RegExp.$1 :
		is('konqueror') ? 'konqueror' :
		is('applewebkit/') ? 'webkit safari' :
		is('mozilla/') ? 'gecko' : '',
		(is('x11') || is('linux')) ? ' linux' :
		is('mac') ? ' mac' :
		is('win') ? ' win' : ''
	].join(''));
}()

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
		// Скрываем открытую боковую панель
		closeAllPanel()

	
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
		const targetPanel = $(this).attr('data-target')
		const action = $(this).attr('data-action')
		const dataPanel = $(this).attr('data-panel')

		// Обработчик для любой кнопки закрытия в панели
		if (!targetPanel && action === 'close') {
			closeAllPanel()
			return 
		}

		// Если панель должна выезжать (как слева)
		if ($('#' + targetPanel).hasClass('panel-toggle')) {
			$('.page').addClass('panel-open')
			$('#' + targetPanel).addClass('is-open')
		} else { // Если aside (правая) панель
			openAsidePanel($('#' + targetPanel))
		}
	})

	function openAsidePanel(panel) {
		console.log(panel)
		$('.page-aside .panel').hide()
		panel.show()
		if ( panel.hasClass('panel-lg') ) {
			$('.page').addClass('aside-lg-open')
		} else {
			$('.page').addClass('aside-open')
		}
	}

	function closeAllPanel() {
		$('.page').removeClass('panel-open aside-open aside-lg-open')
		$('.panel-toggle').removeClass('is-open')
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

	$(document).stop(true).on('click', '.jq-toggleSelect', function (e) {
		e.preventDefault()
		$(this).toggleClass('is-selected')
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
	//        Проверка на существ. реф. карты
	// --------------------------------------------------
	
	$('body').on('submit', '.jq-checkRefCard', function (e) {
		e.preventDefault()
		const $this = $(this)
		const parentGroup = $this.find('input').closest('.form-group')
		const numCard = $this.find('input').val()
		console.log(numCard)
		if (numCard === '1') {
			console.log('success')
			parentGroup.removeClass('is-incorrect').addClass('is-correct')
		} else if (numCard === '0') {
			console.log('error')
			parentGroup.removeClass('is-correct').addClass('is-incorrect')
		}
	})


	// --------------------------------------------------
	//        Смена типа доставки на странице оплаты
	// --------------------------------------------------

	$('body').on('change','#deliveryType',function (e) {
		if($(this).val() == 2){
			$('#deliveryAddress').hide();
			$('#deliveryContact').hide();
			let cost = parseFloat($('#preTotalCost').data('full-cost')) - parseFloat($(this).data('delivery-cost'));

			$('#preTotalCost').text(cost.toLocaleString()+" ₽");
			$('#totalCost').text(cost.toLocaleString()+" ₽");
		} else {
			$('#deliveryAddress').show();
			$('#deliveryContact').show();
			let cost = parseFloat($('#preTotalCost').data('full-cost'));

			$('#preTotalCost').text(cost.toLocaleString()+" ₽");
			$('#totalCost').text(cost.toLocaleString()+" ₽");
		}
	});

	// --------------------------------------------------
	//        Смена типа оплаты на странице оплаты
	// --------------------------------------------------
	$('body').on('change','#paymentType',function (e) {
		if($(this).val() == 2){
			// $('#deliveryPayment').hide();
			// $('#deliveryPaymentDivider').hide();
			$('#paymentOnReceive').hide();
			$('#paymentButton').hide();
			$('#paymentFormButton').show();
		} else {
			// $('#deliveryPayment').show();
			// $('#deliveryPaymentDivider').show();
			$('#paymentOnReceive').show();
			$('#paymentButton').show();
			$('#paymentFormButton').hide();
		}
	});



	// --------------------------------------------------
	//   Сброс статуса поля ввода (correct/incorrect)
	// --------------------------------------------------
	// $(document).on('change keyup input click', '.counter input', function (e) {
	$('body').on('change keyup input click', '.form-control', function (e) {
		e.preventDefault()
		const $this = $(this)
		const parentGroup = $this.closest('.form-group')
		parentGroup.removeClass('is-incorrect is-correct')
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
	})
  
	var refCardsData = [{
			"number": "15917125",
			"date": "01/05/2019 в 22:30",
			"type": "Бонус наставника",
			"from": "711999",
			"to": "628509",
			"summa": "243 000,34",
			"currency": "₽ (руб)",
			"nested": {
				"text": "Задача организации в особенности же общая концепция сложившегося положения укрепляет нас, в нашем стремлении улучшения правильных направлений развития.Задача организации в особенности же новая модель организационной деятельности способствует подготовке и реализации соответствующих моделей активизации.Не следует, однако, забывать, что новая модель организационной деятельности создает все необходимые предпосылки"
			}
		},
		{
			"number": "18818025",
			"date": "29/04/2019 в 10:54",
			"type": "Ежегодный бонус наставника",
			"from": "700999",
			"to": "009300",
			"summa": "1 548,34",
			"currency": "$ (usd)",
			"nested": {
				"text": "Задача организации в особенности же общая концепция сложившегося положения укрепляет нас, в нашем стремлении улучшения правильных направлений развития.Задача организации в особенности же новая модель организационной деятельности способствует подготовке и реализации соответствующих моделей активизации.Не следует, однако, забывать, что новая модель организационной деятельности создает все необходимые предпосылки"
			}
		},
		{
			"number": "18818025",
			"date": "29/04/2019 в 10:54",
			"type": "Ежегодный бонус наставника",
			"from": "700999",
			"to": "009300",
			"summa": "123 48,34",
			"currency": "₽ (руб)",
			"nested": {
				"text": "Задача организации в особенности же общая концепция сложившегося положения укрепляет нас, в нашем стремлении улучшения правильных направлений развития.Задача организации в особенности же новая модель организационной деятельности способствует подготовке и реализации соответствующих моделей активизации.Не следует, однако, забывать, что новая модель организационной деятельности создает все необходимые предпосылки"
			}
		},
		{
			"number": "18818025",
			"date": "29/04/2019 в 10:54",
			"type": "Ежегодный бонус наставника",
			"from": "700999",
			"to": "009300",
			"summa": "430,00",
			"currency": "$ (usd)",
			"nested": {
				"text": "Задача организации в особенности же общая концепция сложившегося положения укрепляет нас, в нашем стремлении улучшения правильных направлений развития.Задача организации в особенности же новая модель организационной деятельности способствует подготовке и реализации соответствующих моделей активизации.Не следует, однако, забывать, что новая модель организационной деятельности создает все необходимые предпосылки"
			}
		}
	]
	
	function format (data) {
		return '<div class="details-container">'+
				'<table width="100%" cellpadding="0" cellspacing="0" border="0" class="details-table">'+
					'<thead>'+
						'<tr class="fz-xs ttu ls c-medium-grey">'+
							'<th colspan="8" class="title">Назначение</th>'+
						'</tr>'+
					'</thead>'+
					'<tbody>' +
						'<tr>'+
							'<td colspan="8">'+data.nested.text+'</td>'+
						'</tr>'+
					'</tbody>'+
				'</table>'+
			'</div>';
	}

	var table = $('#refCardsTable').DataTable({
		// config
		info: false,
		searching: false,
		paging: false,
		// responsive: true,
		autoWidth: false,
		// Column definitions
		columns : [
			{data : 'number'},
			{data : 'date'},
			{data : 'type'},
			{data : 'from'},
			{data : 'to'},
			{data : 'summa'},
			{data : 'currency'},
			{
				className: 'details-control t-right',
				defaultContent: '<button class="btn btn-green btn-outline no-hover jq-toggleSelect">' +
					'<i class="ic ic-angle-down"></i>' +
					'</button>',
				data: null,
				orderable: false,
				width: "86px"
			}
		],
		data : refCardsData,
	})

	$('.datatables tbody').on('click', 'td.details-control .btn', function () {
		var tr = $(this).closest('tr'),
			row = table.row(tr)

		if (row.child.isShown()) {
			tr.next('tr').removeClass('details-row')
			row.child.hide()
			tr.removeClass('shown')
		} else {
			row.child(format(row.data())).show()
			tr.next('tr').addClass('details-row')
			tr.addClass('shown')
		}
	})

	$('.jq-datatables').DataTable({
		// config
		info: false,
		searching: false,
		paging: false,
		autoWidth: false,
		order: [],
		columnDefs: [{
			targets: 'no-sort',
			orderable: false,
		}]
	})
	
	 


	
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