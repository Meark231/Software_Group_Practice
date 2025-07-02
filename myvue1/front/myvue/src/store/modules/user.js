const state = {
    isLoggedIn: false,
    username: '',
    userInfo: null
};

const mutations = {
    SET_LOGIN_STATUS(state, status) {
        state.isLoggedIn = status;
    },
    SET_USERNAME(state, username) {
        state.username = username;
    },
    SET_USER_INFO(state, userInfo) {
        state.userInfo = userInfo;
    },
    CLEAR_USER_DATA(state) {
        state.isLoggedIn = false;
        state.username = '';
        state.userInfo = null;
    }
};

const actions = {
    // 登录
    login({ commit }, userData) {
        commit('SET_LOGIN_STATUS', true);
        commit('SET_USERNAME', userData.username);
        commit('SET_USER_INFO', userData);
        
        // 可选：存储到localStorage（刷新页面后保持登录状态）
        localStorage.setItem('userInfo', JSON.stringify(userData));
    },
    
    // 登出
    logout({ commit }) {
        commit('CLEAR_USER_DATA');
        // 清除localStorage中的用户信息
        localStorage.removeItem('userInfo');
    },
    
    // 从localStorage恢复登录状态
    restoreLoginStatus({ commit }) {
        // 从localStorage获取用户信息
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const userData = JSON.parse(userInfo);
            commit('SET_LOGIN_STATUS', true);
            commit('SET_USERNAME', userData.username);
            commit('SET_USER_INFO', userData);
        }
    }
};

const getters = {
    isLoggedIn: state => state.isLoggedIn,
    username: state => state.username,
    userInfo: state => state.userInfo
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};