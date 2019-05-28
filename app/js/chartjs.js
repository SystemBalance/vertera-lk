
Chart.elements.Rectangle.prototype.draw = function () {
	var ctx = this._chart.ctx;
	var vm = this._view;
	var left, right, top, bottom, signX, signY, borderSkipped, radius;
	var borderWidth = vm.borderWidth;

	// If radius is less than 0 or is large enough to cause drawing errors a max
	//      radius is imposed. If cornerRadius is not defined set it to 0.
	var cornerRadius = this._chart.config.options.cornerRadius;
	var fullCornerRadius = this._chart.config.options.fullCornerRadius;
	var stackedRounded = this._chart.config.options.stackedRounded;
	var typeOfChart = this._chart.config.type;

	if (cornerRadius < 0) {
		cornerRadius = 0;
	}
	if (typeof cornerRadius == 'undefined') {
		cornerRadius = 0;
	}
	if (typeof fullCornerRadius == 'undefined') {
		fullCornerRadius = true;
	}
	if (typeof stackedRounded == 'undefined') {
		stackedRounded = false;
	}

	if (!vm.horizontal) {
		// bar
		left = vm.x - vm.width / 2;
		right = vm.x + vm.width / 2;
		top = vm.y;
		bottom = vm.base;
		signX = 1;
		signY = bottom > top ? 1 : -1;
		borderSkipped = vm.borderSkipped || 'bottom';
	} else {
		// horizontal bar
		left = vm.base;
		right = vm.x;
		top = vm.y - vm.height / 2;
		bottom = vm.y + vm.height / 2;
		signX = right > left ? 1 : -1;
		signY = 1;
		borderSkipped = vm.borderSkipped || 'left';
	}

	// Canvas doesn't allow us to stroke inside the width so we can
	// adjust the sizes to fit if we're setting a stroke on the line
	if (borderWidth) {
		// borderWidth shold be less than bar width and bar height.
		var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
		borderWidth = borderWidth > barSize ? barSize : borderWidth;
		var halfStroke = borderWidth / 2;
		// Adjust borderWidth when bar top position is near vm.base(zero).
		var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
		var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
		var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
		var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
		// not become a vertical line?
		if (borderLeft !== borderRight) {
			top = borderTop;
			bottom = borderBottom;
		}
		// not become a horizontal line?
		if (borderTop !== borderBottom) {
			left = borderLeft;
			right = borderRight;
		}
	}

	ctx.beginPath();
	ctx.fillStyle = vm.backgroundColor;
	ctx.strokeStyle = vm.borderColor;
	ctx.lineWidth = borderWidth;

	// Corner points, from bottom-left to bottom-right clockwise
	// | 1 2 |
	// | 0 3 |
	var corners = [
		[left, bottom],
		[left, top],
		[right, top],
		[right, bottom]
	];

	// Find first (starting) corner with fallback to 'bottom'
	var borders = ['bottom', 'left', 'top', 'right'];
	var startCorner = borders.indexOf(borderSkipped, 0);
	if (startCorner === -1) {
		startCorner = 0;
	}

	function cornerAt(index) {
		return corners[(startCorner + index) % 4];
	}

	// Draw rectangle from 'startCorner'
	var corner = cornerAt(0);
	ctx.moveTo(corner[0], corner[1]);


	var nextCornerId, nextCorner, width, height, x, y;
	for (var i = 1; i < 4; i++) {
		corner = cornerAt(i);
		nextCornerId = i + 1;
		if (nextCornerId == 4) {
			nextCornerId = 0
		}

		nextCorner = cornerAt(nextCornerId);

		width = corners[2][0] - corners[1][0];
		height = corners[0][1] - corners[1][1];
		x = corners[1][0];
		y = corners[1][1];

		var radius = cornerRadius;
		// Fix radius being too large
		if (radius > Math.abs(height) / 2) {
			radius = Math.floor(Math.abs(height) / 2);
		}
		if (radius > Math.abs(width) / 2) {
			radius = Math.floor(Math.abs(width) / 2);
		}

		var x_tl, x_tr, y_tl, y_tr, x_bl, x_br, y_bl, y_br;
		if (height < 0) {
			// Negative values in a standard bar chart
			x_tl = x;
			x_tr = x + width;
			y_tl = y + height;
			y_tr = y + height;

			x_bl = x;
			x_br = x + width;
			y_bl = y;
			y_br = y;

			// Draw
			ctx.moveTo(x_bl + radius, y_bl);

			ctx.lineTo(x_br - radius, y_br);

			// bottom right
			ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius);


			ctx.lineTo(x_tr, y_tr + radius);

			// top right
			fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);


			ctx.lineTo(x_tl + radius, y_tl);

			// top left
			fullCornerRadius ? ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius) : ctx.lineTo(x_tl, y_tl, x_tl, y_tl + radius);


			ctx.lineTo(x_bl, y_bl - radius);

			//  bottom left
			ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

		} else if (width < 0) {
			// Negative values in a horizontal bar chart
			x_tl = x + width;
			x_tr = x;
			y_tl = y;
			y_tr = y;

			x_bl = x + width;
			x_br = x;
			y_bl = y + height;
			y_br = y + height;

			// Draw
			ctx.moveTo(x_bl + radius, y_bl);

			ctx.lineTo(x_br - radius, y_br);

			//  Bottom right corner
			fullCornerRadius ? ctx.quadraticCurveTo(x_br, y_br, x_br, y_br - radius) : ctx.lineTo(x_br, y_br, x_br, y_br - radius);

			ctx.lineTo(x_tr, y_tr + radius);

			// top right Corner
			fullCornerRadius ? ctx.quadraticCurveTo(x_tr, y_tr, x_tr - radius, y_tr) : ctx.lineTo(x_tr, y_tr, x_tr - radius, y_tr);

			ctx.lineTo(x_tl + radius, y_tl);

			// top left corner
			ctx.quadraticCurveTo(x_tl, y_tl, x_tl, y_tl + radius);

			ctx.lineTo(x_bl, y_bl - radius);

			//  bttom left corner
			ctx.quadraticCurveTo(x_bl, y_bl, x_bl + radius, y_bl);

		} else {

			var lastVisible = 0;
			for (var findLast = 0, findLastTo = this._chart.data.datasets.length; findLast < findLastTo; findLast++) {
				if (!this._chart.getDatasetMeta(findLast).hidden) {
					lastVisible = findLast;
				}
			}
			var rounded = this._datasetIndex === lastVisible;

			if (rounded) {
				//Positive Value
				ctx.moveTo(x + radius, y);

				ctx.lineTo(x + width - radius, y);

				// top right
				ctx.quadraticCurveTo(x + width, y, x + width, y + radius);


				ctx.lineTo(x + width, y + height - radius);

				// bottom right
				if (fullCornerRadius || typeOfChart == 'horizontalBar')
					ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
				else
					ctx.lineTo(x + width, y + height, x + width - radius, y + height);


				ctx.lineTo(x + radius, y + height);

				// bottom left
				if (fullCornerRadius)
					ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
				else
					ctx.lineTo(x, y + height, x, y + height - radius);


				ctx.lineTo(x, y + radius);

				// top left
				if (fullCornerRadius || typeOfChart == 'bar')
					ctx.quadraticCurveTo(x, y, x + radius, y);
				else
					ctx.lineTo(x, y, x + radius, y);
			} else {
				ctx.moveTo(x, y);
				ctx.lineTo(x + width, y);
				ctx.lineTo(x + width, y + height);
				ctx.lineTo(x, y + height);
				ctx.lineTo(x, y);
			}
		}

	}

	ctx.fill();
	if (borderWidth) {
		ctx.stroke();
	}
}

function getRandomArbitary(min, max) {
	return Math.random() * (max - min) + min;
}

var barChartData = {
	labels: ['Январь', 'февраль', 'Март', 'Апрель', 'Май'],
	datasets: [{
		label: 'Каб',
		backgroundColor: '#689F38',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'БКБ',
		backgroundColor: '#AD1457',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'ЛБ',
		backgroundColor: '#009688',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'LSBB',
		backgroundColor: '#7E57C2',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'Иб',
		backgroundColor: '#1A237E',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'МБЧБ',
		backgroundColor: '#03A9F4',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'Бтм',
		backgroundColor: '#EF5350',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'Бикб',
		backgroundColor: '#18FFFF',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'ббзп',
		backgroundColor: '#90A4AE',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}, {
		label: 'ббн',
		backgroundColor: '#388E3C',
		data: [
			getRandomArbitary(100, 1000),
			getRandomArbitary(200, 2000),
			getRandomArbitary(300, 3000),
			getRandomArbitary(400, 4000),
			getRandomArbitary(500, 5000),
		]
	}]
}

Chart.defaults.scale.gridLines.display = false;
Chart.defaults.global.defaultFontFamily = '"Ptrootui", sans-serif'

function updateLegendAction(e, datasetIndex) {
	var index = datasetIndex;
		var ci = e.view.chart;
		console.log(ci)
    var meta = ci.getDatasetMeta(index);
    // See controller.isDatasetVisible comment
    meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
	document.getElementById("label"+index).style.opacity = document.getElementById("label"+index).style.opacity === '0.2' ? '1' : '0.2';
	// We hid a dataset ... rerender the chart
     ci.update();                                                                                      
}  

const totalizer = {
	id: 'totalizer',

	beforeUpdate: chart => {
		let totals = {}
		let utmost = 0

		chart.data.datasets.forEach((dataset, datasetIndex) => {
			if (chart.isDatasetVisible(datasetIndex)) {
				utmost = datasetIndex
				dataset.data.forEach((value, index) => {
					totals[index] = (totals[index] || 0) + value
				})
			}
		})

		chart.$totalizer = {
			totals: totals,
			utmost: utmost
		}
	}
}

// window.onload = function () {
	var ctx = document.getElementById('myChart').getContext('2d');
	var chart = new Chart(ctx, {
		type: 'bar',
		data: barChartData,
		options: {
			responsive: true,
			maintainAspectRatio: false,
			cornerRadius: 10,
			fullCornerRadius: false,
			legendCallback: function (legendarray) {
				var legendHtml = [];
				for (var i = 0; i < legendarray.data.datasets.length; i++) {
					legendHtml.push('<div id="label' + i + '" class="item" onclick="updateLegendAction(event, ' + '\'' + legendarray.legend.legendItems[i].datasetIndex + '\'' + ')" > <div class="item-figure circle sz-sm" style="background-color:' + legendarray.data.datasets[i].backgroundColor + ';"></div>');
					if (legendarray.data.datasets[i].label) {
						legendHtml.push('<div class="item-text fz-xs ttu ls c-dark-grey">' + legendarray.data.datasets[i].label + '</div></div>');
					}
				}
				return legendHtml.join("");
			},
			legend: {
				display: false,
			},
			scales: {
				xAxes: [{
					stacked: true,
					barThickness: 12,
					gridLines: {
						drawBorder: false
					},
					ticks: {
						beginAtZero: true,
						suggestedMax: 50,
						stepSize: 5000,
						fontColor: '#939393',
						fontSize: 10,
						lineHeight: '16px',
						callback: function (value, index, values) {
							return value.toUpperCase()
						}
					}
				}],
				yAxes: [{
					stacked: true,
					radius: 25,
					gridLines: {
						drawBorder: false
					},
					ticks: {
						min: 0,
						maxTicksLimit: 6,
						stepSize: 5000,
						fontColor: '#939393',
						fontSize: 10,
						lineHeight: '16px',
						fontFamily: '"Ptrootui", sans-serif',
						// Include a dollar sign in the ticks
						callback: function (value, index, values) {
							// Convert the number to a string and splite the string every 3 charaters from the end
							value = value.toString();
							value = value.split(/(?=(?:...)*$)/);

							// Convert the array to a string and format the output
							value = value.join('');
							return parseInt(value).toFixed(2)
						}
					}
				}]
			},
			plugins: {
				datalabels: {
					formatter: (value, ctx) => {
						const total = ctx.chart.$totalizer.totals[ctx.dataIndex]
						return total.toLocaleString('fr-FR', {
							style: 'currency',
							currency: 'EUR'
						})
					},
					align: 'end',
					anchor: 'end',
					display: function(ctx) {
						return ctx.datasetIndex === ctx.chart.$totalizer.utmost
					}
				}
			},
			pan: {
				enabled: true,
				mode: "xy",
				rangeMin: {
					x: 0,
					y: 0
				},
				rangeMax: {
					x: 300000
				},
			},
			zoom: {
				enabled: true,
				drag: false,
				mode: "y",
				rangeMin: {
					x: 0,
					y: 0
				},
				rangeMax: {
					x: 300000
				},
			}
		},
		plugins: [totalizer]
	})
	var newlegend = document.getElementsByClassName("chart-head-legend")[0].innerHTML = chart.generateLegend();
// }
