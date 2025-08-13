document.addEventListener('DOMContentLoaded', function() {
    if (typeof JFCustomWidget === 'undefined') {
        console.error('JotForm Custom Widget library not found.');
        return;
    }

    JFCustomWidget.subscribe('ready', function(){
        console.log('Jotform is ready. Attaching event listener.');

        const widgetContainer = document.querySelector('.container');
        const searchBtn = document.getElementById('search-btn');
        const zipcodeInput = document.getElementById('zipcode');
        const resultDisplay = document.getElementById('result');
        const errorDisplay = document.getElementById('error');

        JFCustomWidget.requestFrameResize({ height: widgetContainer.offsetHeight });

        searchBtn.addEventListener('click', function() {
            const zipcode = zipcodeInput.value;
            if (!zipcode || !/^[0-9]{7}$/.test(zipcode)) {
                errorDisplay.textContent = '有効な7桁の郵便番号を入力してください。';
                resultDisplay.textContent = '';
                JFCustomWidget.sendSubmit({ valid: false });
                return;
            }

            const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`;
            console.log('Attempting to fetch from API:', apiUrl); // 添加了日志

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    errorDisplay.textContent = '';
                    if (data.status === 200 && data.results) {
                        const address = data.results[0];
                        const fullAddress = `${address.address1}${address.address2}${address.address3}`;
                        resultDisplay.textContent = fullAddress;
                        JFCustomWidget.sendSubmit({ valid: true, value: fullAddress });
                    } else {
                        resultDisplay.textContent = '';
                        errorDisplay.textContent = data.message || '該当する住所が見つかりませんでした。';
                        JFCustomWidget.sendSubmit({ valid: false });
                    }
                })
                .catch(error => {
                    // 这是最关键的日志，如果fetch被阻止，就会在这里看到错误
                    console.error('FETCH FAILED INSIDE JOTFORM:', error);
                    errorDisplay.textContent = 'API aPI呼び出し中にエラーが発生しました。';
                    JFCustomWidget.sendSubmit({ valid: false });
                })
                .finally(() => {
                    JFCustomWidget.requestFrameResize({ height: widgetContainer.offsetHeight });
                });
        });
    });
});