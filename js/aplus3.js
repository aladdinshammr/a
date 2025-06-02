(function() {
    'use strict';
    
    const API_BASE = 'http://192.168.133.2';
    const ERROR_SELECTOR = '#error';
    const ERROR_ALERT = '#alert-error';
    const USERNAME_SELECTOR = '#uname';
    const SUBMIT_BTN = '#submit_btn';
    const SPEED_CONTAINER = '#speedn';
    const COA = false;
    
    const $error = $(ERROR_SELECTOR);
    const $errorAlert = $(ERROR_ALERT);
    const $username = $(USERNAME_SELECTOR);
    const $submitBtn = $(SUBMIT_BTN);
    const $speedContainer = $(SPEED_CONTAINER);
    const $coa = $(COA);
    
    let countdownTimer = null;
    let currentMac = '';
    let currentServer = '';
	let changeRateUrl = '';


    function initialize() {
        $error.hide();
        $username.focus().val($.cookie('uname'));
        $submitBtn.on('click', handleSubmit);
        $username.on('keyup', clearError);
		//console.log("Welcome to APlus!");
    }

    function handleSubmit(event) {
		//console.log('handleSubmit');
        event.preventDefault();
        clearError();
        
        const username = $username.val().trim();
        currentMac = $("input[name=mac]").val();
        currentServer = $("input[name=server]").val();
        if (!username) return;
        $.ajax({
            url: `${API_BASE}/api/check/${encodeURIComponent(username)}`,
            data: { 
                mac: currentMac,
                server: currentServer 
            },
            timeout: 5000
        })
        .done(handleApiResponse)
        .fail(handleApiError);
    }

    function handleApiResponse(data) {
		//console.log('handleApiResponse'+ typeof data.status);
        if (data.status === 'off' || data.status === null) {
            performLogin('');
            return;
        }

		if (data.change_rate_url) {
			changeRateUrl = data.change_rate_url;
		}

        if (data.status === 'error') {
            showErrorMessage(data.reply);
            return;
        }

        if (data.status === 'on') {
            handleOnStatus(data);
        }
    }

    function handleOnStatus(data) {
		//console.log('handleOnStatus');
        if (data.radius_reply.status === 'Access-Reject') {
            showErrorMessage(
                data.radius_reply["Reply-Message"] || "الدخول غير مسموح"
            );
            return;
        }

        if (data.radius_reply.status === 'Access-Accept') {
            if (data.remain_Simultaneous === 0 || $coa === false) {
                showErrorMessage("مستخدم من قبل جهاز اخر");
                return;
            }

            if (data.speed_levels) {
                renderSpeedOptions(data);
                startCountdown(data.speed_levels_waiting);
            } else {
                performLogin('');
            }
        }
    }

    function renderSpeedOptions(data) {
		//console.log('renderSpeedOptions');
        const speedOptions = data.speed_levels.map(option => `
            <input type="radio" name="speed" id="value-${option.id}" 
                   value="${option.value}"
                   ${option.default ? 'checked' : ''}>
            <label for="value-${option.id}" class="speed-option">
                <div class="select-dots"></div>
                <div class="text">${option.name}</div>
            </label>
        `).join('');

        $speedContainer.html(`
            <div class="wrapper">
                <div class="title">حدد سرعتك المناسبة</div>
                <div class="box">${speedOptions}</div>
            </div>
        `);

        $('input[name=speed]').on('click', handleSpeedSelection);
    }

    function handleSpeedSelection(event) {
		//console.log('handleSpeedSelection');
        const speedValue = event.target.value;
        clearInterval(countdownTimer);
        
		$.get(`${API_BASE}/${changeRateUrl}${speedValue}`, {
            mac: currentMac,
            server: currentServer
        }).done(performLogin(speedValue));
    }

    function startCountdown(seconds) {
		//console.log('startCountdown');
        let remaining = seconds;
        updateButtonState(remaining);
        
        countdownTimer = setInterval(() => {
            remaining--;
            updateButtonState(remaining);
            
            if (remaining < 0) {
                clearInterval(countdownTimer);
                $('input[name=speed]:checked').trigger('click');
            }
        }, 1000);
    }

    function updateButtonState(seconds) {
		//console.log('updateButtonState');
        $submitBtn
            .toggleClass('disabled', seconds >= 0)
            .prop('disabled', seconds >= 0)
            .val(seconds >= 0 
                ? `تسجيل الدخول ${seconds}` 
                : 'تسجيل الدخول'
            );
    }

    function showErrorMessage(type) {
		//console.log('showErrorMessage');
        const messages = {
            quota: 'إنتهى رصيد التحميل',
            validity: 'إنتهت الصلاحية',
            uptime: 'إنتهى رصيد الوقت',
            default: 'حدث خطأ غير متوقع'
        };
        //$error.show();
		//$errorAlert.css('display', 'block');
        $error.text(messages[type] || type || messages.default).show();
    }

    function clearError() {
		//console.log('clearError');
        $error.hide().text('');
    }

    function performLogin(speedValue) {
		//console.log('performLogin');
		$.cookie('uname',$username.val(),{expires:60480});
		 $("input[name=domain]").val(speedValue);
        $('#login_form')
            .attr('action', $('input[name=link_login]').val())
            .submit();
    }

    function handleApiError(error) {
		//console.log('');

        //console.error('API Error:', error);
        console.log('لا يمكن الوصول إلى الخادم!');
        setTimeout(performLogin(''), 3000);
    }

    $(document).ready(initialize);
})();