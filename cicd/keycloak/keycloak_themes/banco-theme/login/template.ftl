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

<#-- Script de conmutación de contraseña corregido y robusto -->
  <script type="text/javascript">
    document.addEventListener("DOMContentLoaded", function () {
      // 1. Forzar type="button" en todos los botones que no sean el submit principal
      const allButtons = document.querySelectorAll("form button");
      allButtons.forEach(function (btn) {
        if (btn.id !== "kc-login" && btn.type !== "submit" && btn.name !== "login") {
          btn.setAttribute("type", "button");
        }
      });
    });

    // 2. Listener en fase de captura para conmutar la visibilidad
    document.addEventListener("click", function (event) {
      const btn = event.target.closest("button");
      if (!btn) return;

      // Ignorar si es el botón de enviar credenciales
      if (btn.id === "kc-login" || btn.type === "submit" || btn.name === "login") {
        return;
      }

      // Identificar si el botón pulsado es el del ojo
      const isEyeButton =
        btn.hasAttribute("data-password-toggle") ||
        (btn.getAttribute("aria-label") && /password|contrase|clave/i.test(btn.getAttribute("aria-label"))) ||
        btn.closest(".pf-v5-c-input-group, .pf-c-input-group") !== null;

      if (!isEyeButton) return;

      // Detener eventos que puedan disparar submits involuntarios
      event.preventDefault();
      event.stopPropagation();

      // Localizar el campo de contraseña por ID o name
      const form = btn.closest("form") || document;
      const passInput = form.querySelector('input#password') ||
                        form.querySelector('input[name="password"]') ||
                        form.querySelector('input[type="password"], input[type="text"]');

      if (passInput) {
        const isCurrentlyPassword = passInput.getAttribute("type") === "password";
        const targetType = isCurrentlyPassword ? "text" : "password";

        passInput.setAttribute("type", targetType);
        btn.setAttribute("aria-label", isCurrentlyPassword ? "Ocultar contraseña" : "Ver contraseña");
      }
    }, true);
  </script>
</body>
</html>
</#macro>