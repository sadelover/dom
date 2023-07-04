// persagy数据查询折线图主题
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
    echarts.registerTheme('light', {
        "color": [
            "#0094E6",
            "#00D6B9",
            "#FFBA6B",
            "#FF1493",
            "#9400D3",
            "#483D8B",
            "#FFFF00",
            "#98FB98",
            "#2F4F4F",
        ],
        "backgroundColor": "rgba(255,255,255,0)",
        "textStyle": {},
        "title": {
            "textStyle": {
                "color": "#333"
            },
            "subtextStyle": {
                "color": "#aaa"
            }
        },
        "line": {
            "itemStyle": {
                    "borderWidth": 1
            },
            "lineStyle": {
                    "width": 2
            },
            "symbolSize": 4,
            "symbol": "emptyCircle",
            "smooth": false
        },
        "radar": {
            "itemStyle": {
                    "borderWidth": 1
            },
            "lineStyle": {
                    "width": 2
            },
            "symbolSize": 4,
            "symbol": "emptyCircle",
            "smooth": false
        },
        "bar": {
            "itemStyle": {
                    "barBorderWidth": 0,
                    "barBorderColor": "#cccccc",
                "emphasis": {
                    "barBorderWidth": 0,
                    "barBorderColor": "#cccccc"
                }
            }
        },
        "pie": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "scatter": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "boxplot": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "parallel": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "sankey": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "funnel": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "gauge": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
                "emphasis": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc"
                }
            }
        },
        "candlestick": {
            "itemStyle": {
                    "color": "#c23531",
                    "color0": "#314656",
                    "borderColor": "#c23531",
                    "borderColor0": "#314656",
                    "borderWidth": 1
            }
        },
        "graph": {
            "itemStyle": {
                    "borderWidth": 0,
                    "borderColor": "#cccccc",
            },
            "lineStyle": {
                    "width": 1,
                    "color": "#aaa",
            },
            "symbolSize": 4,
            "symbol": "emptyCircle",
            "smooth": false,
            "color": [
                "#ffba6b",
                "#00d6b9",
                "#0091ff"
            ],
            "label": {
                        "color": "#eeeeee"
            }
        },
        "map": {
            "itemStyle": {
                    "areaColor": "#ffffff",
                    "borderColor": "#444",
                    "borderWidth": 0.5,
                "emphasis": {
                    "areaColor": "rgba(255,215,0,0.8)",
                    "borderColor": "#444",
                    "borderWidth": 1
                }
            },
            "label": {
                        "color": "#000",
                "emphasis": {
                        "color": "rgb(100,0,0)"
                }
            }
        },
        "geo": {
            "itemStyle": {
                    "areaColor": "#ffffff",
                    "borderColor": "#444",
                    "borderWidth": 0.5,
                "emphasis": {
                    "areaColor": "rgba(255,215,0,0.8)",
                    "borderColor": "#444",
                    "borderWidth": 1
                }
            },
            "label": {
                        "color": "#000",
              
                "emphasis": {
                        "color": "rgb(100,0,0)"
                }
            }
        },
        "categoryAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "rgb(150,150,150)"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#8d9399"
                }
            },
            "axisLabel": {
                "show": true,
                    "color": "rgb(90,90,90)"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#ccc"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "valueAxis": {
            "axisLine": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisTick": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisLabel": {
                "show": true,
                    "color": "rgb(90,90,90)"
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "type":"dashed",
                    "color": [
                        "#ccc"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "logAxis": {
            "axisLine": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisTick": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisLabel": {
                "show": false,
                    "color": "#333"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#ccc"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "timeAxis": {
            "axisLine": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisTick": {
                "show": false,
                "lineStyle": {
                    "color": "#333"
                }
            },
            "axisLabel": {
                "show": false,
                    "color": "#333"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#ccc"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "toolbox": {
            "iconStyle": {
                    "borderColor": "rgba(98,98,98,1)",
                "emphasis": {
                    "borderColor": "#000"
                }
            }
        },
        "legend": {
            "textStyle": {
                "color": "#8d9399"
            }
        },
        "tooltip": {
            "axisPointer": {
                "lineStyle": {
                    "type":"dotted",
                    "color": "#0093FF",
                    "width": "1"
                },
                "crossStyle": {
                    "color": "#c3c7cb",
                    "width": "1"
                }
            },
            "backgroundColor":'#FFFFFF',
            "extraCssText":'box-shadow:0px 2px 10px 0px rgba(31,35,41,0.1)',
            "textStyle": {
                "color": "#333940",
                "fontSize":"12px",
                "fontFamily":'MicrosoftYaHei',
                "lineHeight":'18px'
            }
        },
        "timeline": {
            "lineStyle": {
                "color": "#ffffff",
                "width": 1
            },
            "itemStyle": {
                    "color": "#ffffff",
                    "borderWidth": 1,
                "emphasis": {
                    "color": "#a9334c"
                }
            },
            "controlStyle": {
                    "color": "#ffffff",
                    "borderColor": "#ffffff",
                    "borderWidth": 0.5,
                "emphasis": {
                    "color": "#ffffff",
                    "borderColor": "#ffffff",
                    "borderWidth": 0.5
                }
            },
            "checkpointStyle": {
                "color": "#e43c59",
                "borderColor": "rgba(194,53,49, 0.5)"
            },
            "label": {
                        "color": "#293c55",
                "emphasis": {
                    "textStyle": {
                        "color": "#293c55"
                    }
                }
            }
        },
        "visualMap": {
            "color": [
                "#ffba6b",
                "#00d6b9",
                "#0091ff"
            ]
        },
        "dataZoom": {
            "backgroundColor": "rgba(235,238,240,0)",
            "dataBackgroundColor": "rgba(255,255,255,0.3)",
            "fillerColor": "rgba(250,250,250,0.4)",
            "handleColor": "#ffffff",
            "handleSize": "100%",
            "textStyle": {
                "color": "#333"
            }
        },
        "markPoint": {
            "label": {
                        "color": "#eeeeee",
                "emphasis": {
                    "textStyle": {
                        "color": "#eeeeee"
                    }
                }
            }
        }
    });
}));
