import './css/styles.css';
import VWM from './components/bb/vwm'

//export {renderToDom} from './components/react-map/map'

export default VWM;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        /*navigator.serviceWorker.register('sw.js');*/
    });
}