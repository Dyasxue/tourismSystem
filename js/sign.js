        // 获取按钮和模态框
        const loginRegisterBtn = document.getElementById('loginRegisterBtn');
        const signmodal = document.getElementById('loginRegisterModal');
        const closeBtn = document.querySelector('.close');

        // 获取界面元素
        const loginPage = document.getElementById('loginPage');
        const registerPage = document.getElementById('registerPage');
        const forgotPasswordPage = document.getElementById('forgotPasswordPage');

        // 获取切换按钮
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToForgotPassword = document.getElementById('switchToForgotPassword');
        const switchToLoginFromRegister = document.getElementById('switchToLoginFromRegister');
        const switchToLoginFromForgotPassword = document.getElementById('switchToLoginFromForgotPassword');

        // 获取协议详情页面元素
        const agreementModal = document.getElementById('agreementModal');
        const userAgreementLink = document.getElementById('userAgreementLink');

        // 点击按钮时显示模态框
        loginRegisterBtn.addEventListener('click', () => {
            signmodal.style.display = 'block';
            showLoginPage(); // 默认显示登录界面
        });

        // 点击关闭按钮时隐藏模态框
        closeBtn.addEventListener('click', () => {
            signmodal.style.display = 'none';
        });

        // 清空表单内容
        function clearForm(formId) {
            const form = document.getElementById(formId);
            if (form) {
                form.reset();
            }
        }

        // 显示登录界面
        function showLoginPage() {
            loginPage.classList.remove('hidden');
            registerPage.classList.add('hidden');
            forgotPasswordPage.classList.add('hidden');
            clearForm('loginForm'); // 清空登录表单
        }

        // 显示注册界面
        switchToRegister.addEventListener('click', () => {
            loginPage.classList.add('hidden');
            registerPage.classList.remove('hidden');
            forgotPasswordPage.classList.add('hidden');
            clearForm('registerForm'); // 清空注册表单
        });

        // 显示忘记密码界面
        switchToForgotPassword.addEventListener('click', () => {
            loginPage.classList.add('hidden');
            registerPage.classList.add('hidden');
            forgotPasswordPage.classList.remove('hidden');
            clearForm('forgotPasswordForm'); // 清空忘记密码表单
        });

        // 从注册界面返回登录界面
        switchToLoginFromRegister.addEventListener('click', showLoginPage);

        // 从忘记密码界面返回登录界面
        switchToLoginFromForgotPassword.addEventListener('click', showLoginPage);

        // 处理登录表单提交
        document.getElementById('loginForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (document.getElementById('agreeCheckbox').checked) {
                alert(`登录成功！用户名: ${username}, 密码: ${password}`);
                signmodal.style.display = 'none';
            } else {
                alert("请先同意用户协议！");
            }
        });

        // 处理注册表单提交
        document.getElementById('registerForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            alert(`注册成功！用户名: ${newUsername}, 密码: ${newPassword}`);
            showLoginPage(); // 返回登录界面
        });

        // 处理忘记密码表单提交
        document.getElementById('forgotPasswordForm').addEventListener('submit', (event) => {
            event.preventDefault();
            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword1 = document.getElementById('newPassword1').value;
            const newPassword2 = document.getElementById('newPassword2').value;

            // 判断新密码是否与原密码相同
            if (newPassword1 === oldPassword) {
                alert("新密码不能与原密码相同！");
                return;
            }

            // 判断两次输入的新密码是否一致
            if (newPassword1 !== newPassword2) {
                alert("两次输入的新密码不一致，请重新输入！");
                return;
            }

            alert("密码重置成功！");
            showLoginPage(); // 返回登录界面
        });

        // 点击用户协议链接显示协议详情页面
        userAgreementLink.addEventListener('click', (event) => {
            event.preventDefault();
            agreementModal.style.display = 'block';
        });

        // 关闭协议详情页面
        agreementModal.querySelector('.close').addEventListener('click', () => {
            agreementModal.style.display = 'none';
        });