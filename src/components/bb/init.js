document.onreadystatechange = () => {
    if (document.readyState === 'complete') {

        var obj = new VWM();
        obj.createObfDropdown('ge-obf-selection-wrapper', 'ge-revier-selection-wrapper');
        obj.createAreaList('ge-area-list-wrapper');
        obj.createAreaInfo('ge-area-info');
        
        document.getElementById('ge-layer-verbiss').addEventListener('click', (e) => {
            document.getElementById('ge-layer-verbiss').classList.add("active");
            document.getElementById('ge-layer-schaele').classList.remove("active");

            obj.changeLayer('verbiss')
        })
        obj.changeLayer('verbiss')
        document.getElementById('ge-layer-verbiss').classList.add("active");
        
        document.getElementById('ge-layer-schaele').addEventListener('click', () => {
            document.getElementById('ge-layer-schaele').classList.add("active");
            document.getElementById('ge-layer-verbiss').classList.remove("active");

            obj.changeLayer('schaele')
        })

        document.getElementById('ge-year-2021').addEventListener('click', (e) => {
            document.getElementById('ge-year-2021').classList.add("active");
            document.getElementById('ge-year-2020').classList.remove("active");

            //document.getElementById('ge-layer-schaele').classList.add("hidden");
            document.getElementById('ge-layer-schaele').setAttribute('disabled', 'disabled');
            obj.changeYear('2021')
        })
        
        document.getElementById('ge-year-2020').addEventListener('click', () => {
            document.getElementById('ge-year-2020').classList.add("active");
            document.getElementById('ge-year-2021').classList.remove("active");

            document.getElementById('ge-layer-schaele').removeAttribute('disabled');
            obj.changeYear('2020')
        })
        document.getElementById('ge-year-2020').classList.add("active");
        obj.changeYear('2020')

        document.getElementById('ge-remove-8').addEventListener('click', () => obj.removeLayer('9'));
        document.getElementById('ge-remove-9').addEventListener('click', () => obj.removeLayer('10'));

        
        document.getElementById('ge-toggle-3D').addEventListener('click', function () {
            obj.setPitch(60);
        });
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            document.body.classList.add('ge-is-mobile');
        }

        document.body.addEventListener('touchstart', function (e) {
            if(e.touches.length > 2) {
                obj.pitchStart(e);
            }
        });
        document.body.addEventListener('touchmove', function (e) {
            if(e.touches.length > 2) {
                obj.pitchMove(e);
            }
        });
        setTimeout(() => document.getElementById('ge-loading-wrapper').innerHTML = '', 1000)
    }
};