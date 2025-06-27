import { io } from 'socket.io-client';

// 本地运行时使用
const socket = io('http://localhost:3000');

export default socket;

