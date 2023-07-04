import { unset } from 'lodash';
import moment from 'moment';
import http from '../../../common/http';


const serverUrl = window.localStorage.getItem("serverUrl")


// ------------------------------------
// Constants
// ------------------------------------
export const RESET = 'history.RESET';
export const SET_LAYER_VISIBILITY = 'history.SET_LAYER_VISIBILITY';
export const TOGGLE_LAYER_VISIBILITY = 'history.TOGGLE_LAYER_VISIBILITY';
export const SET_POINT_VISIBILITY = 'history.SET_POINT_VISIBILITY';
export const ADD_POINT = 'history.ADD_POINT';
export const DELETE_POINT = 'history.DELETE_POINT';
export const UPDATE_POINT_INFO = 'history.UPDATE_POINT_INFO';
export const SAVE_CHART_OPTIONS = 'history.SAVE_CHART_OPTIONS';

// ------------------------------------
// Actions
// ------------------------------------
export function reset() {
    return {
        type: RESET
    }
}

export function showLayer() {
    return {
        type: SET_LAYER_VISIBILITY,
        visible: true
    }
}

export function hideLayer() {
    return {
        type: SET_LAYER_VISIBILITY,
        visible: false
    }
}

export function toggleLayer() {
    return {
        type: TOGGLE_LAYER_VISIBILITY
    }
}

export function showPoint(name) {
    return {
        type: SET_POINT_VISIBILITY,
        name: name,
        visible: true
    }
}

export function hidePoint(name) {
    return {
        type: SET_POINT_VISIBILITY,
        name: name,
        visible: false
    }
}

export function addPoint(point) {
    return {
        type: ADD_POINT,
        point
    }

}
//将从设备界面的浮动框里传过来的点名，请求点释义
export function getToolPoint(pointName) {
    return function (dispatch, getState) {
        return http.post('/analysis/get_point_info_from_s3db', {
            pointList: pointName
        }).then(
            serverData => {
                for (var key in serverData.data) {
                    const pointData = pointName.map(row => {
                        return {
                            name: row,
                            description: serverData.data[row].description
                        }
                    })
                    dispatch(addPoint(pointData));
                    return;
                }
                //若没有请求到点的信息，则将释义写为空
                const pointData = pointName.map(row => {
                    return {
                        name: row,
                        description: ''
                    }
                })
                dispatch(addPoint(pointData));
            }
        )
            .catch(
                () => {
                    //若没有请求到点的信息，则将释义写为空
                    const pointData = pointName.map(row => {
                        return {
                            name: row,
                            description: ''
                        }
                    })
                    dispatch(addPoint(pointData));
                }

            )
    }
}

export function deletePoint(name) {
    return {
        type: DELETE_POINT,
        name: name
    }
}

export function updatePointInfo(map) {
    let info = {};
    Object.keys(map).forEach(row => {
        info[row] = {
            min: '-',
            max: '-',
            avg: '-'
        };

        if (map[row] && map[row].length) {
            let min = Number.POSITIVE_INFINITY;
            let max = Number.NEGATIVE_INFINITY;
            let sum = 0;
            map[row].forEach(row => {
                if (row < min) { min = row; }
                if (row > max) { max = row; }
                sum += row;
            });
            info[row]['min'] = Number(min).toFixed(3);
            info[row]['max'] = Number(max).toFixed(3);
            info[row]['avg'] = (Math.round(sum / map[row].length * 100) / 100).toFixed(3);
        }
    });

    return {
        type: UPDATE_POINT_INFO,
        info
    }
}

export function saveChartOptions(timeOptions) {
    return {
        type: SAVE_CHART_OPTIONS,
        timeOptions
    }
}

export const actions = {
    reset,
    showLayer,
    hideLayer,
    toggleLayer,
    showPoint,
    hidePoint,
    addPoint,
    deletePoint,
    saveChartOptions
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [RESET]: () => {
        return initialState;
    },
    [SET_LAYER_VISIBILITY]: (state, action) => {
        return { ...state, visible: action.visible }
    },
    [TOGGLE_LAYER_VISIBILITY]: (state) => {
        return { ...state, visible: true }
    },
    [SET_POINT_VISIBILITY]: (state, action) => {
        const points = state.points.map(
            row => {
                if (row['name'] === action['name']) {
                    return {
                        ...row,
                        visible: action['visible']
                    }
                }
                return row;
            }
        );


        //存储点列表
        let timeOptions = {}
        if (window.localStorage.getItem(serverUrl) != undefined) {
            let obj = JSON.parse(window.localStorage.getItem(serverUrl));
            if (obj.timeOptions != undefined) {
                timeOptions = obj.timeOptions
            }
        }
        if (Object.keys(timeOptions).length != 0) {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                timeOptions:timeOptions,
                pointList:points
            }));
        }else {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                pointList:points
            }));
        }
        //存储结束


        return { ...state, points }
    },
    //添加新点时，将点名数组，重组成点名和是否可见的对象数组
    [ADD_POINT]: (state, action) => {
        const points = action.point.map(
            row => {
                return {
                    name: row.name,
                    description: row.description,
                    visible: true
                }
            }
        );


        //存储点列表
        let timeOptions = {}
        if (window.localStorage.getItem(serverUrl) != undefined) {
            let obj = JSON.parse(window.localStorage.getItem(serverUrl));
            if (obj.timeOptions != undefined) {
                timeOptions = obj.timeOptions
            }
        }
        if (Object.keys(timeOptions).length != 0) {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                timeOptions:timeOptions,
                pointList:points.concat(state.points)
            }));
        }else {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                pointList:points.concat(state.points)
            }));
        }
        //存储结束


        return { ...state, points: points.concat(state.points) }
    },
    [DELETE_POINT]: (state, action) => {
        const points = state.points.filter(
            row => row['name'] !== action['name']
        )

        //存储点列表
        let timeOptions = {}
        if (window.localStorage.getItem(serverUrl) != undefined) {
            let obj = JSON.parse(window.localStorage.getItem(serverUrl));
            if (obj.timeOptions != undefined) {
                timeOptions = obj.timeOptions
            }
        }
        if (Object.keys(timeOptions).length != 0) {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                timeOptions:timeOptions,
                pointList:points
            }));
        }else {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                pointList:points
            }));
        }
        //存储结束

        return { ...state, points }
    },
    [UPDATE_POINT_INFO]: (state, action) => {
        const info = action['info'];
        const points = state.points.map(
            row => {
                return { ...row, ...info[row['name']] }
            }
        )

        //存储点列表
        let timeOptions = {}
        if (window.localStorage.getItem(serverUrl) != undefined) {
            let obj = JSON.parse(window.localStorage.getItem(serverUrl));
            if (obj.timeOptions != undefined) {
                timeOptions = obj.timeOptions
            }
        }
        if (Object.keys(timeOptions).length != 0) {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                timeOptions:timeOptions,
                pointList:points
            }));
        }else {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                pointList:points
            }));
        }
        //存储结束

        return { ...state, points }
    },
    [SAVE_CHART_OPTIONS]: (state, action) => {
        //存储时间配置
        let pointList = []
        if (window.localStorage.getItem(serverUrl) != undefined) {
            let obj = JSON.parse(window.localStorage.getItem(serverUrl));
            if (obj.pointList != undefined) {
                pointList = pointList.concat(obj.pointList)
            }
        }
        if (pointList.length != 0) {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                pointList:pointList,
                timeOptions:{...state.timeOptions, ...action.timeOptions}
            }));
        }else {
            window.localStorage.setItem(serverUrl,JSON.stringify({
                timeOptions:{...state.timeOptions, ...action.timeOptions}
            }));
        }
        //存储结束
       
        return { ...state, timeOptions: { ...state.timeOptions, ...action.timeOptions } }
    }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
    points:  JSON.parse(window.localStorage.getItem(serverUrl)) &&  JSON.parse(window.localStorage.getItem(serverUrl)).pointList != undefined ? JSON.parse(window.localStorage.getItem(serverUrl)).pointList : [],
    visible: false,
    timeOptions: JSON.parse(window.localStorage.getItem(serverUrl)) && JSON.parse(window.localStorage.getItem(serverUrl)).timeOptions != undefined ? 
        {
            timeStart: moment(JSON.parse(window.localStorage.getItem(serverUrl)).timeOptions.timeStart),
            timeEnd: moment(JSON.parse(window.localStorage.getItem(serverUrl)).timeOptions.timeEnd),
            timeFormat: JSON.parse(window.localStorage.getItem(serverUrl)).timeOptions.timeFormat
        } :  {
            timeStart: moment().startOf('day'),
            timeEnd: moment(),
            timeFormat: 'm5'
    }
};
export default function homeReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(state, action) : state
}
