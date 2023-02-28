// 
// Theme plugins and scripts
// 

$(function () {
  charts.init()

  listjs.init()

  navbar.init()

  tooltip.init()

  swiper.init()

  highlight.init()

  autosizer.init()

  $.fancybox.defaults.loop = true
})


// 
// List.js
// 

var listjs = {
  init: function () {
    var $checkbox_all = $('.list-checkbox-all')
    var $checkbox_one = $('.list-checkbox')
    var $list_alert = $('.list-alert')
    var $list_count = $('.list-alert-count')
    var $list_alert_close = $('.list-alert-close')

    $checkbox_all.click(function () {
      if (this.checked) {
        $checkbox_one.prop("checked", true)
        handleAlert(true)
      } else {
        $checkbox_one.prop("checked", false)
        handleAlert(false)
      }
    })

    $checkbox_one.click(function () {
      if ($checkbox_one.is(":checked")) {
        handleAlert(true)
      } else {
        handleAlert(false)
      }
    })

    $list_alert_close.click(function () {
      $checkbox_all.prop("checked", false)
      $checkbox_one.prop("checked", false)
      handleAlert(false)
    })

    function handleAlert(show) {
      $list_count.text($checkbox_one.filter(':checked').length)

      if (show) {
        $list_alert.addClass("show").css("z-index", "1035")
      } else {
        $list_alert.removeClass("show").css("z-index", "-1")
      }
    }
  }
}


// 
// Navbar behavior
// 

var navbar = {
  init: function () {
    if (!window.utils.isMobile()) {
      this.initDropdownHover()
    }

    this.toggleSidebar()
  },

  // show/hide dropdown on hover
  initDropdownHover: function () {
    var $dropdowns = $('.navbar .dropdown')
    $dropdowns.each(function (index, item) {
      var $item = $(this)

      $item.hover(function () {
        $item.find("> [data-bs-toggle='dropdown']").attr("aria-expanded", true)
        $item.find("> .dropdown-menu").addClass("show").attr("data-bs-popper", "none")
      }, function () {
        $item.find("> [data-bs-toggle='dropdown']").attr("aria-expanded", false)
        $item.find("> .dropdown-menu").removeClass("show").removeAttr("data-bs-popper")
      })
    })
  },

  toggleSidebar: function () {
    var $btns = $('[data-toggle="sidebar"]')
    var $sidebar_lg = $('.navbar-vertical:not(.navbar-vertical-sm)')
    var $sidebar_sm = $('.navbar-vertical.navbar-vertical-sm')

    $btns.click(function (e) {
      e.preventDefault()
      if ($(this).data("sidebar") == "lg") {
        $sidebar_lg.hide()
        $sidebar_sm.show()
      } else {
        $sidebar_lg.show()
        $sidebar_sm.hide()
      }
    })
  }
}


//
// Initialize a Swiper instance via data-toggle="swiper"
// and passing the options object via data-options
//

var swiper = {
  init: function () {
    $("[data-toggle='swiper']").each(function(index, item) {
      new Swiper(item, $(item).data('options'))
    })
  }
}


//
// Initialize Bootstrap tooltip plugins
//

var tooltip = {
  init: function () {
    $('[data-bs-toggle="tooltip"]').tooltip()
  }
}


// 
// Code syntax highlighting
// used in the docs
// 

var highlight = {
  init: function () {
    $('code.hl').each(function(i, block) {
      hljs.highlightBlock(block)
    })
  }
}


// 
// Initialize an autosize element
// via data-toggle="autosize"
// 

var autosizer = {
  init: function () {
    autosize($("[data-toggle='autosize']"))
  }
}


// 
// Chart.js
// 

var charts = {
  init: function () {
    this.defaults()
    this.charts()
    this.legends()
  },

  defaults: function () {
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.color = "#95aac9";
    Chart.defaults.font.family = 'SpartanMB';
    Chart.defaults.font.size = 13;
    Chart.defaults.layout.padding = 0;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.backgroundColor = "#3d569c";
    Chart.defaults.elements.line.tension = .4;
    Chart.defaults.elements.line.borderWidth = 3.5;
    Chart.defaults.elements.line.borderColor = "#3d569c";
    Chart.defaults.elements.line.backgroundColor = "transparent";
    Chart.defaults.elements.line.borderCapStyle = "rounded";
    Chart.defaults.elements.bar.backgroundColor = "#3d569c";
    Chart.defaults.elements.bar.borderWidth = 0;
    Chart.defaults.elements.bar.borderRadius = 5;
    Chart.defaults.elements.bar.borderSkipped = false;
    Chart.defaults.datasets.bar.maxBarThickness = 8;
    Chart.defaults.elements.arc.backgroundColor = "#3d569c",
    Chart.defaults.elements.arc.borderColor = "#fff";
    Chart.defaults.elements.arc.borderWidth = 4;
    Chart.defaults.elements.arc.hoverBorderColor = "#fff";
    Chart.defaults.plugins.tooltip.enabled = false;
    Chart.defaults.plugins.tooltip.mode = "index";
    Chart.defaults.plugins.tooltip.intersect = false;
    Chart.defaults.plugins.tooltip.external = this.tooltip;
    Chart.defaults.plugins.tooltip.callbacks.label = this.label;
    Chart.defaults.datasets.doughnut.cutout = "75%";
    Chart.defaults.scales.linear.grid = {
      borderDash: [10],
      color: "#e3ebf6",
      drawBorder: false,
      drawTicks: false
    };
    Chart.defaults.scales.linear.ticks.beginAtZero = true;
    Chart.defaults.scales.linear.ticks.padding = 10;
    Chart.defaults.scales.linear.ticks.stepSize = 10;
    Chart.defaults.scales.category.grid = {
      drawBorder: false,
      drawOnChartArea: false,
      drawTicks: false
    };
    Chart.defaults.scales.category.ticks.padding = 20;

    Chart.overrides.doughnut.plugins.tooltip.callbacks.title = function(e) {
      return e[0].label
    }
    Chart.overrides.doughnut.plugins.tooltip.callbacks.label = function(e) {
      const callback = e.chart.options.plugins.tooltip.callbacks,
            before = callback.beforeLabel() || "",
            after = callback.afterLabel() || "";
      return before + e.formattedValue + after
    }
  },

  legends: function () {
    var legends = document.querySelectorAll('[data-toggle="legend"]')

    legends.forEach(function(item) {
      const chart = Chart.getChart(item),
            div = document.createElement("div");

      chart.legend.legendItems?.forEach((legend => {
        div.innerHTML += `<span class="chart-legend-item"><span class="chart-legend-color" style="background-color: ${legend.fillStyle}"></span>${legend.text}</span>`
      }));
      document.querySelector(item.dataset.target).appendChild(div)
    })
  },

  charts: function () {
    const earnings = document.getElementById("earningsChart")
    const expenses = document.getElementById("expensesChart")
    const source = document.getElementById("sourceChart")
    const ecommerce = document.getElementById("ecommerceChart")

    earnings && new Chart(earnings, {
      type: 'line',
      options: {
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return '$' + value + 'k';
              }
            }
          }
        }
      },
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Earned',
          data: [3, 12, 7, 13.5, 8, 24, 13, 38, 27, 20, 35, 40]
        }]
      }
    })

    expenses && new Chart(expenses, {
      type: 'bar',
      options: {
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return '$' + value + 'k';
              }
            }
          }
        }
      },
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'This year',
          data: [25, 20, 33, 22, 17, 10, 18, 26, 28, 26, 20, 32]
        }, {
          label: 'Last year',
          data: [22, 23, 27, 28, 14, 13, 12, 18, 18, 22, 25, 38],
          backgroundColor: ['#e8eef5']
        }]
      }
    });

    source && new Chart(source, {
      type: 'doughnut',
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: function() {
                return '%'
              }
            }
          }
        }
      },
      data: {
        labels: ['Facebook', 'Dribbble', 'Google'],
        datasets: [{
          data: [53, 13, 34],
          backgroundColor: ['#98BFF4', '#f6f9fc', '#E5E5FF']
        }]
      }
    });

    ecommerce && new Chart(ecommerce, {
      type: 'bar',
      options: {
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return '$' + value + 'k';
              }
            }
          }
        }
      },
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'This year',
          data: [25, 20, 33, 22, 17, 10, 18, 26, 28, 26, 20, 32],
          backgroundColor: ['#3d569c']
        }, {
          label: 'Last year',
          data: [22, 23, 27, 28, 14, 13, 12, 18, 18, 22, 25, 38],
          backgroundColor: ['#e8eef5']
        }]
      }
    });
  },

  label: function (e) {
    const scale = e.chart.scales[e.dataset.yAxisID || "y"];
    return (e.chart.tooltip.dataPoints.length > 1 ? " " + e.dataset.label + " " : " ") + scale.options.ticks.callback.apply(scale, [e.parsed.y, 0, []])
  },

  tooltip: function (e) {
    const {
      chart,
      tooltip
    } = e;

    let custom_tooltip = function(chart) {
      let custom = chart.canvas.parentNode.querySelector("div");

      if (!custom) {
        custom = document.createElement("div");
        custom.setAttribute("id", "custom-tooltip");
        custom.setAttribute("role", "tooltip");
        custom.classList.add("popover", "bs-popover-top");

        const arrow = document.createElement("div"),
              container = document.createElement("div");

        arrow.classList.add("popover-arrow", "translate-middle-x");
        container.classList.add("popover-container")

        custom.appendChild(arrow)
        custom.appendChild(container)
        chart.canvas.parentNode.appendChild(custom)
      }

      return custom
    }(chart);

    if (tooltip.opacity === 0) {
      return custom_tooltip.style.visibility = "hidden";
    }

    if (tooltip.body) {
      const title = tooltip.title || [],
            body_lines = tooltip.body.map((e => e.lines)),
            container_title = document.createElement("div"),
            container_body = document.createElement("div");

      title.forEach((e => {
        const header = document.createElement("h3");
        header.classList.add("popover-header", "text-center", "text-nowrap");
        const text = document.createTextNode(e);
        header.appendChild(text)
        container_title.appendChild(header)
      }));

      body_lines.forEach((e, index) => {
        const label_color = tooltip.labelColors[index],
              color = document.createElement("span"),
              body = document.createElement("div");

        color.classList.add("popover-body-color")
        color.style.backgroundColor = chart.config.type === "line" && label_color.borderColor !== "rgba(0,0,0,0.1)" ? label_color.borderColor : label_color.backgroundColor;
        
        body.classList.add("popover-body", "d-flex", "align-items-center", "text-nowrap"), 
        body.classList.add(body.length > 1 ? "justify-content-left" : "justify-content-center");
        const text = document.createTextNode(e);
        body.appendChild(color)
        body.appendChild(text)
        container_body.appendChild(body)
      });

      const container = custom_tooltip.querySelector(".popover-container");
      for (; container.firstChild;) container.firstChild.remove();
      container.appendChild(container_title)
      container.appendChild(container_body)
    }

    const {
      offsetLeft,
      offsetTop
    } = chart.canvas;

    custom_tooltip.style.visibility = "visible"
    custom_tooltip.style.left = offsetLeft + tooltip.caretX + "px"
    custom_tooltip.style.top = offsetTop + tooltip.caretY + "px"
    custom_tooltip.style.transform = "translateX(-50%) translateY(-100%) translateY(-1rem)"
  }
}


// 
// Extra Helpers
// 

window.utils = {
  isMobile: function () {
    if (window.innerWidth <= 992) {
      return true
    } else {
      return false
    }
  }
}
