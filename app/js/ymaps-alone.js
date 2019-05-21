ymaps.ready(function () {
	const myMapElements = document.querySelectorAll('.ymap-alone')
	Array.from(myMapElements).forEach(function(el) {
		ymaps.geocode('Россия, Нижний Новгород, улица Юлиуса Фучика, 10к2', {
			results: 1
		}).then(function (res) {
			// Выбираем первый результат геокодирования.
			var firstGeoObject = res.geoObjects.get(0),
				// Создаем карту с нужным центром.
				myMap = new ymaps.Map(el, {
					center: firstGeoObject.geometry.getCoordinates(),
					zoom: 17,
					controls: []
				}),
				// Своя метка на карте
				myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
					hintContent: 'Пункт выдачи №25'
				}, {
					// Опции.
					// Необходимо указать данный тип макета.
					iconLayout: 'default#image',
					// Своё изображение иконки метки.
					iconImageHref: 'img/icons/map-marker.svg',
					// Размеры метки.
					iconImageSize: [120, 120],
					// Смещение левого верхнего угла иконки относительно
					// её "ножки" (точки привязки).
					iconImageOffset: [-60, -60]
				});
			// Отрисовка этой метки
			myMap.geoObjects.add(myPlacemark);
		}, function (err) {
			// Если геокодирование не удалось, сообщаем об ошибке.
			alert(err.message);
		});
	})
});
