import './css/styles.css';
import './components/bb/init'
import VWM from './components/bb/vwm'

export default VWM;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js');
    });
}