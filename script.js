JFCustomWidget.subscribe('ready', function(){
    console.log('Jotform is ready.');

    const widgetContainer = document.querySelector('.container');
    const searchBtn = document.getElementById('search-btn');
    const zipcodeInput = document.getElementById('zipcode');
    const resultDisplay = document.getElementById('result');
    const errorDisplay = document.getElementById('error');

    // Adjust iframe height
    JFCustomWidget.requestFrameResize({ height: widgetContainer.offsetHeight });

    searchBtn.addEventListener('click', function() {
        const zipcode = zipcodeInput.value;
        // Basic validation
        if (!zipcode || !/^[0-9]{7}$/.test(zipcode)) {
            errorDisplay.textContent = '有効な7桁の郵便番号を入力してください。';
            resultDisplay.textContent = '';
            JFCustomWidget.sendSubmit({ valid: false });
            return;
        }

        const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                errorDisplay.textContent = ''; // Clear previous errors

                if (data.status === 200 && data.results) {
                    const address = data.results[0];
                    const fullAddress = `${address.address1}${address.address2}${address.address3}`;
                    resultDisplay.textContent = fullAddress;

                    // Send the address to the Jotform form
                    JFCustomWidget.sendSubmit({ 
                        valid: true, 
                        value: fullAddress 
                    });
                } else {
                    resultDisplay.textContent = '';
                    errorDisplay.textContent = data.message || '該当する住所が見つかりませんでした。';
                    JFCustomWidget.sendSubmit({ valid: false });
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                resultDisplay.textContent = '';
                errorDisplay.textContent = '住所の取得中にエラーが発生しました。';
                JFCustomWidget.sendSubmit({ valid: false });
            })
            .finally(() => {
                // Adjust iframe height again after showing results/errors
                JFCustomWidget.requestFrameResize({ height: widgetContainer.offsetHeight });
            });
    });
});
