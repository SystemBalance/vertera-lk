
function formSerialize(form) {
	var obj = {};
	var elements = form.querySelectorAll("input, select, textarea")
	for (var i = 0; i < elements.length; ++i) {
		var element = elements[i];
		var name = element.name;
		var value = element.value;

		if (name) {
			obj[name] = value;
		}
	}
	return JSON.stringify(obj);
}

function clearForm(myFormElement) {

	var elements = myFormElement.elements;

	myFormElement.reset();

	for (i = 0; i < elements.length; i++) {

		field_type = elements[i].type.toLowerCase();

		switch (field_type) {

			case "text":
			case "password":
			case "textarea":
			case "hidden":

				elements[i].value = "";
				break;

			case "radio":
			case "checkbox":
				if (elements[i].checked) {
					elements[i].checked = false;
				}
				break;

			case "select-one":
			case "select-multi":
				elements[i].selectedIndex = -1;
				break;

			default:
				break;
		}
	}
}

$(document).ready(function () {
	jQuery.fn.exists = function () {
		return $(this).length
	}

	ymaps.ready(function () {
		// Создание макета балуна
		ymaps.option.presetStorage.add('custom#default', {
			iconLayout: 'default#image',
			iconImageHref: 'img/icons/map-marker.svg',
			iconImageSize: [120, 120],
			iconImageOffset: [-60, -60],
			hideIconOnBalloonOpen: false
		})

		ymaps.option.presetStorage.add('custom#active', {
			iconLayout: 'default#image',
			iconImageHref: 'img/icons/baloon-icon-active.svg',
			iconImageSize: [120, 120],
			iconImageOffset: [-60, -60],
			hideIconOnBalloonOpen: false
		})

		const myMapElements = document.querySelectorAll('.ymap-multi')
		Array.from(myMapElements).forEach(function(el) {
			// Обработчик добавления адреса на карту
			const addForm = document.querySelector(".jq-formAddAddress")
			if (addForm) {
				addCounter = 0
				addForm.addEventListener("submit", function (e) {
					e.preventDefault()
					addCounter = addCounter + 1
					const form = this
					const formData = JSON.parse(formSerialize(form))
					const fullAddress = formData.country + ' ' + formData.city + ' ' + formData.address
					let newObj

					ymaps.geocode(fullAddress, {
						results: 1
					}).then(function (res) {
						// Выбираем первый результат геокодирования.
						var resultGeoObject = res.geoObjects.get(0)
						newObj = {
							id: DB[0].addresses.length -1 + addCounter,
							geometry: {
								type: "Point",
								clusterCaption: "Добавленная клиентом метка",
								coordinates: resultGeoObject.geometry.getCoordinates()
							},
							properties: {
								address: fullAddress,
								number: formData.pointName,
								owner: formData.owner,
								phone: "+7 909 620-68-69",
								email: "verteramockva@mail.ru",
								schedule: "с 10.00 до 21.00, без обеда и выходных"
							}
						}
						objectManager.add([newObj])
						clearForm(form)
					}, function (err) {
						// Если геокодирование не удалось, сообщаем об ошибке.
						alert(err.message);
					})
				}, false);
			}

			// Глобальная переменная для адресов, карты
			let myMap, objectManager, DB

			$.ajax({
				url: "db/json_content.json"
			}).done(function (data) {
				DB = data
				for (i in data) {
					objectManager.add(data[i].addresses)
				}
			})

			myMap = new ymaps.Map(el, {
				center: [55.75669587833707,37.62240572007821],
				zoom: 16,
				controls: [],
				behaviors: ['default', 'scrollZoom']
			}, {
				searchControlProvider: 'yandex#search'
			}),
	
			objectManager = new ymaps.ObjectManager({
				// Чтобы метки начали кластеризоваться, выставляем опцию.
				clusterize: true,
				// ObjectManager принимает те же опции, что и кластеризатор.
				gridSize: 32,
				clusterDisableClickZoom: false,
				openBalloonOnClick: false
			}),
	
			MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
				'<div class="ymaps-content">' +
				'<div class="address">' +
				'<div class="arrow"></div>' +
				'<div class="ymaps-content-close">' +
				'<span class="close"></span>' +
				'</div>' +
				'$[[options.contentLayout]]' +
				'</div>' +
				'</div>', {
				/**
				 * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
				 * @function
				 * @name build
				 */
				build: function () {
					this.constructor.superclass.build.call(this)
	
					this._$element = $('.ymaps-content', this.getParentElement())
	
					this.applyElementOffset()
	
					this._$element.find('.close')
						.on('click', $.proxy(this.onCloseClick, this))
				},
	
				/**
				 * Удаляет содержимое макета из DOM.
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
				 * @function
				 * @name clear
				 */
				clear: function () {
					this._$element.find('.close')
						.off('click')
	
					this.constructor.superclass.clear.call(this)
				},
	
				/**
				 * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
				 * @function
				 * @name onSublayoutSizeChange
				 */
				onSublayoutSizeChange: function () {
					MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments)
	
					if (!this._isElement(this._$element)) {
						return
					}
	
					this.applyElementOffset()
	
					this.events.fire('shapechange')
				},
	
				/**
				 * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
				 * @function
				 * @name applyElementOffset
				 */
				applyElementOffset: function () {
					this._$element.css({
						left: -(this._$element[0].offsetWidth / 2),
						top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
					})
				},
	
				/**
				 * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
				 * @function
				 * @name onCloseClick
				 */
				onCloseClick: function (e) {
					e.preventDefault()
	
					this.events.fire('userclose')
				},
	
				/**
				 * Используется для автопозиционирования (balloonAutoPan).
				 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
				 * @function
				 * @name getClientBounds
				 * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
				 */
				getShape: function () {
					if (!this._isElement(this._$element)) {
						return MyBalloonLayout.superclass.getShape.call(this)
					}
	
					var position = this._$element.position()
	
					return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
						[position.left, position.top],
						[
							position.left + this._$element[0].offsetWidth,
							position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
						]
					]))
				},
	
				/**
				 * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
				 * @function
				 * @private
				 * @name _isElement
				 * @param {jQuery} [element] Элемент.
				 * @returns {Boolean} Флаг наличия.
				 */
				_isElement: function (element) {
					return element && element[0] && element.find('.arrow')[0]
				}
			}),
	
			// Создание вложенного макета содержимого балуна.
			MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
				'<h4 class="address-title h4 ls">Пункт выдачи: $[properties.number]</h4>' +
				'<div class="address-content">' +
				'<div class="group">' +
				'<div class="group-name ttu ls fz-xs">' +
				'<i class="ic ic-address-arrow"></i>' +
				'<span>Адрес</span>' +
				'</div>' +
				'<div class="group-text h6">$[properties.address]</div>' +
				'</div>' +
				'<div class="group">' +
				'<div class="group-name ttu ls fz-xs">' +
				'<i class="ic ic-address-phone"></i>' +
				'<span>Телефон</span>' +
				'</div>' +
				'<div class="group-text h6">$[properties.phone]</div>' +
				'</div>' +
				'<div class="group">' +
				'<div class="group-name ttu ls fz-xs">' +
				'<i class="ic ic-address-mail"></i>' +
				'<span>Эл. почта</span>' +
				'</div>' +
				'<div class="group-text h6">' +
				'<a href="mailto:$[properties.email]" class="link link-main">$[properties.email]</a>' +
				'</div>' +
				'</div>' +
				'<div class="group">' +
				'<div class="group-name ttu ls fz-xs">' +
				'<i class="ic ic-user"></i>' +
				'<span>Владелец</span>' +
				'</div>' +
				'<div class="group-text h6">$[properties.owner]</div>' +
				'</div>' +
				'<div class="group m-0">' +
				'<div class="group-name ttu ls fz-xs">' +
				'<span>Режим работы</span>' +
				'</div>' +
				'<div class="group-text h6">$[properties.schedule]</div>' +
				'</div>' +
				'</div>'
			),
	
			clusterIcons = [{
				href: 'img/icons/baloon-medium.svg',
				size: [62, 62],
				// задаем отступ, чтобы метка центрировалась
				offset: [-31, -31]
			}, {
				href: 'img/icons/baloon-large.svg',
				size: [80, 80],
				offset: [-40, -40]
			}],
	
			// задаем массив, указывающий граничные значения размеров кластеров
			// элементов в массиве должно быть на 1 меньше, чем описано меток.
			clusterNumbers = [10, 30],
	
			// Сделаем макет содержимого иконки кластера,      
			MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
				'<div class="ymap-claster">{{ properties.geoObjects.length }}</div>'
			)
	
			// Чтобы задать опции одиночным объектам и кластерам,
			// обратимся к дочерним коллекциям ObjectManager.
			objectManager.objects.options.set({
				preset: 'custom#default',
				balloonLayout: MyBalloonLayout,
				balloonContentLayout: MyBalloonContentLayout,
			})
	
			objectManager.clusters.options.set({
				margin: [20],
				clusterIcons: clusterIcons,
				clusterNumbers: clusterNumbers,
				clusterIconContentLayout: MyIconContentLayout,
				hideIconOnBalloonOpen: false
			})
	
			myMap.geoObjects.add(objectManager)
			
			// Закрыть активную метку по клику на карте
			myMap.events.add('click', function (e) {
				myMap.balloon.close()
			})
		
			// Отслеживание клика по балуну и проверка на открытость содержимого
			objectManager.objects.events.add('click', function (e) {
				e.preventDefault()
				var objectId = e.get('objectId')
				if (objectManager.objects.balloon.isOpen(objectId)) {
					objectManager.objects.balloon.close()
					objectManager.objects.setObjectOptions(objectId, {
						preset: 'custom#default'
					})
				} else {
					objectManager.objects.setObjectOptions(objectId, {
						preset: 'custom#active'
					})
					object = objectManager.objects.getById(objectId)

					myMap.panTo([object.geometry.coordinates[0], object.geometry.coordinates[1]])
						.then(function () {
							let pixelCenter = myMap.getGlobalPixelCenter(myMap.getCenter())
							pixelCenter = [
								pixelCenter[0],
								pixelCenter[1] - 200
							]
							var geoCenter = myMap.options.get('projection').fromGlobalPixels(pixelCenter, myMap.getZoom());
							myMap.setCenter(geoCenter, myMap.getZoom(), {
								duration: 500
							})
							setTimeout(function() {
								objectManager.objects.balloon.open(objectId);
							}, 500);
						}, function (err) {
							alert('Произошла ошибка ' + err);
						}, this);
				}
			})
	
			// Отслеживание закрытия содержимого балуна и сброс активной иконки
			objectManager.objects.events.add('balloonclose', function (e) {
				var objectId = e.get('objectId')
				objectManager.objects.setObjectOptions(objectId, {
					preset: 'custom#default'
				})
			})
		})


	
	})
})