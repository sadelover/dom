(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports', 'echarts'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports, require('echarts'));
  } else {
    // Browser globals
    factory({}, root.echarts);
  }
}(this, function (exports, echarts) {
  var log = function (msg) {
    if (typeof console !== 'undefined') {
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log('ECharts is not Loaded');
    return;
  }

  var contrastColor = "#eee";  //佰诗得
  if(localStorage.getItem('serverOmd')=="best"||localStorage.getItem('serverOmd')=="persagy"){
    contrastColor = 'rgba(0,0,0,0.7)'
  }

  var axisCommon = function () {
    return {
      axisLine: {
        lineStyle: {
          color: contrastColor
        }
      },
      axisTick: {
        lineStyle: {
          color: contrastColor
        }
      },
      axisLabel: {
          color: contrastColor
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#bbb'
        }
      },
      splitArea: {
        areaStyle: {
          color: contrastColor
        }
      }
    };
  };

  var colorPalette = ['#0091FF','#82C7FC','#F9908B','#F54E45','#64E8D6','#eedd78','#73a373','#73b9bc','#7289ab', '#91ca8c','#f49f42'];
  if(localStorage.getItem('serverOmd')=="best"||localStorage.getItem('serverOmd')=="persagy"){
    var theme = {
      color: colorPalette,
      backgroundColor: 'RGB(255,255,255)',
      tooltip: {
        borderColor: 'rgba(0,0,0,0.7)',
        padding: [8, 16],
        axisPointer: {
          lineStyle: {
            color: contrastColor
          },
          crossStyle: {
            color: contrastColor
          }
        }
      },
      legend: {
        textStyle: {
          color: contrastColor
        }
      },
      textStyle: {
        color: contrastColor
      },
      title: {
        textStyle: {
          color: contrastColor
        }
      },
      toolbox: {
        iconStyle: {
            borderColor: contrastColor
        }
      },
      dataZoom: {
        textStyle: {
          color: contrastColor
        }
      },
      visualMap: {
        textStyle: {
          color: contrastColor
        }
      },
      timeline: {
        lineStyle: {
          color: contrastColor
        },
        itemStyle: {
            color: colorPalette[1]
        },
        label: {
              color: contrastColor
        },
        controlStyle: {
            color: contrastColor,
            borderColor: contrastColor
        }
      },
      timeAxis: axisCommon(),
      logAxis: axisCommon(),
      valueAxis: axisCommon(),
      categoryAxis: axisCommon(),
  
      line: {
        symbol: 'circle'
      },
      graph: {
        color: colorPalette
      },
      gauge: {
        title: {
          textStyle: {
            color: contrastColor
          }
        }
      },
      candlestick: {
        itemStyle: {
            color: '#FD1050',
            color0: '#0CF49B',
            borderColor: '#FD1050',
            borderColor0: '#0CF49B'
        }
      }
    };
  }else{
    var theme = {
      color: colorPalette,
      backgroundColor: '#222c3b',
      tooltip: {
        borderColor: '#313d4f',
        padding: [8, 16],
        axisPointer: {
          lineStyle: {
            color: contrastColor
          },
          crossStyle: {
            color: contrastColor
          }
        }
      },
      legend: {
        textStyle: {
          color: contrastColor
        }
      },
      textStyle: {
        color: contrastColor
      },
      title: {
        textStyle: {
          color: contrastColor
        }
      },
      toolbox: {
        iconStyle: {
            borderColor: contrastColor
        }
      },
      dataZoom: {
        textStyle: {
          color: contrastColor
        }
      },
      visualMap: {
        textStyle: {
          color: contrastColor
        }
      },
      timeline: {
        lineStyle: {
          color: contrastColor
        },
        itemStyle: {
            color: colorPalette[1]
        },
        label: {
              color: contrastColor
        },
        controlStyle: {
            color: contrastColor,
            borderColor: contrastColor
        }
      },
      timeAxis: axisCommon(),
      logAxis: axisCommon(),
      valueAxis: axisCommon(),
      categoryAxis: axisCommon(),
  
      line: {
        symbol: 'circle'
      },
      graph: {
        color: colorPalette
      },
      gauge: {
        title: {
          textStyle: {
            color: contrastColor
          }
        }
      },
      candlestick: {
        itemStyle: {
            color: '#FD1050',
            color0: '#0CF49B',
            borderColor: '#FD1050',
            borderColor0: '#0CF49B'
        }
      }
    };
  }
  theme.categoryAxis.splitLine.show = false;
  echarts.registerTheme('dark', theme);
}));
