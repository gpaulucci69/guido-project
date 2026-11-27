<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'es'}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>${(realm.displayName)!(realm.name)!'Keycloak'}</title>
    
    <#-- Estilos CSS -->
    <#if properties?? && properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties?? && properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>

    <#-- Scripts JS base -->
    <#if properties?? && properties.scriptsCommon?has_content>
        <#list properties.scriptsCommon?split(' ') as script>
            <script src="${url.resourcesCommonPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <#if properties?? && properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>

<body>

  <div class="card-dark">

    <div class="header-container">
      <#if client?? && client.attributes?? && (client.attributes.logoUri)?has_content>
        <div class="logo-wrapper">
          <img src="${client.attributes.logoUri}" alt="Logo" class="client-logo" />
        </div>
      </#if>

      <h2 class="client-title">
        ${(client.name)!(client.clientId)!'Portal Corporativo'}
      </h2>

      <p class="client-subtitle">
        ${(client.description)!'Autenticación segura de usuarios'}
      </p>
    </div>

    <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
        <div class="alert-box <#if message.type = 'error'>alert-error<#elseif message.type = 'success'>alert-success<#else>alert-info</#if>">
            ${kcSanitize(message.summary)?no_esc}
        </div>
    </#if>

    <#nested "form">

  </div>

<#-- Script de UI (placeholders, íconos unificados y toggle de contraseña) -->
  <script type="text/javascript">
    document.addEventListener("DOMContentLoaded", function () {
      const SVG_MAIL =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="2" y="4" width="20" height="16" rx="3"></rect>' +
          '<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>' +
        '</svg>';

      const SVG_EYE_OPEN =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"></path>' +
          '<circle cx="12" cy="12" r="3"></circle>' +
        '</svg>';

      // 1. Configurar placeholder y envolver campo de Email con su ícono unificado
      const userInput = document.getElementById("username");
      const userLabel = document.querySelector('label[for="username"]');

      if (userInput) {
        const emailText = userLabel ? userLabel.textContent.trim() : "Email";
        userInput.setAttribute("placeholder", emailText || "Email");

        const pfWrapper = userInput.closest(".pf-v5-c-form-control, .pf-c-form-control") || userInput;

        if (!pfWrapper.parentElement.classList.contains("custom-input-group")) {
          const rowGroup = document.createElement("div");
          rowGroup.className = "custom-input-group";
          pfWrapper.parentNode.insertBefore(rowGroup, pfWrapper);
          rowGroup.appendChild(pfWrapper);

          const iconSpan = document.createElement("span");
          iconSpan.className = "input-side-icon";
          iconSpan.setAttribute("aria-hidden", "true");
          iconSpan.innerHTML = SVG_MAIL;
          rowGroup.appendChild(iconSpan);
        }
      }

      // 2. Configurar placeholder y reemplazar el ícono del ojo por el SVG unificado
      const passInput = document.getElementById("password");
      const passLabel = document.querySelector('label[for="password"]');
      if (passInput) {
        const passText = passLabel ? passLabel.textContent.trim() : "Contraseña";
        passInput.setAttribute("placeholder", passText || "Contraseña");
      }

      const eyeBtn = document.querySelector(
        'button[aria-label*="password"], button[aria-label*="contraseña"], button[data-password-toggle]'
      );
      if (eyeBtn) {
        eyeBtn.innerHTML = SVG_EYE_OPEN;
      }

      // 3. Forzar type="button" en todos los botones que no sean el submit principal
      const allButtons = document.querySelectorAll("form button");
      allButtons.forEach(function (btn) {
        if (btn.id !== "kc-login" && btn.type !== "submit" && btn.name !== "login") {
          btn.setAttribute("type", "button");
        }
      });
    });

    // 4. Listener en fase de captura para conmutar visibilidad e ícono (abierto/tachado)
    document.addEventListener("click", function (event) {
      const btn = event.target.closest("button");
      if (!btn) return;

      if (btn.id === "kc-login" || btn.type === "submit" || btn.name === "login") {
        return;
      }

      const isEyeButton =
        btn.hasAttribute("data-password-toggle") ||
        (btn.getAttribute("aria-label") && /password|contrase|clave/i.test(btn.getAttribute("aria-label"))) ||
        btn.closest(".pf-v5-c-input-group, .pf-c-input-group") !== null;

      if (!isEyeButton) return;

      event.preventDefault();
      event.stopPropagation();

      const SVG_EYE_OPEN =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"></path>' +
          '<circle cx="12" cy="12" r="3"></circle>' +
        '</svg>';

      const SVG_EYE_OFF =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>' +
          '<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>' +
          '<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>' +
          '<line x1="2" y1="2" x2="22" y2="22"></line>' +
        '</svg>';

      const form = btn.closest("form") || document;
      const passInput = form.querySelector('input#password') ||
                        form.querySelector('input[name="password"]') ||
                        form.querySelector('input[type="password"], input[type="text"]');

      if (passInput) {
        const isCurrentlyPassword = passInput.getAttribute("type") === "password";
        const targetType = isCurrentlyPassword ? "text" : "password";

        passInput.setAttribute("type", targetType);
        btn.innerHTML = isCurrentlyPassword ? SVG_EYE_OFF : SVG_EYE_OPEN;
        btn.setAttribute("aria-label", isCurrentlyPassword ? "Ocultar contraseña" : "Ver contraseña");
      }
    }, true);
  </script>
</body>
</html>
</#macro>