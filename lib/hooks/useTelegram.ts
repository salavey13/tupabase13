import { useCallback, useEffect, useState } from 'react';
import { TelegramWebApp, WebAppUser, PopupParams, ScanQrPopupParams } from '@/types/telegram';

interface UseTelegramProps {
  onBackButtonPressed?: () => void;
}

const mockUser: WebAppUser = {
  id: 413553377,
  first_name: 'Test',
  username: 'SALAVEY13',
  language_code: 'en',
};

export function useTelegram(props: UseTelegramProps = {}) {
  const { onBackButtonPressed } = props;
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [webAppVersion, setWebAppVersion] = useState<number>(0);
  const [isInTelegramContext, setIsInTelegramContext] = useState(false);

  const handleBackButton = useCallback(() => {
    if (onBackButtonPressed) {
      onBackButtonPressed();
    } else if (tg && webAppVersion >= 6.1) {
      tg.close();
    }
  }, [onBackButtonPressed, tg, webAppVersion]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scriptId = 'telegram-web-app-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          const telegram = (window as any).Telegram?.WebApp as TelegramWebApp;
          if (telegram) {
            telegram.ready();
            setTg(telegram);
            setWebAppVersion(parseFloat(telegram.version));
            setIsInTelegramContext(true);

            const user = telegram.initDataUnsafe?.user || mockUser;
            setUser(user);
            setTheme(telegram.colorScheme);
          } else {
            setIsInTelegramContext(false);
          }
        };
      }
    }
  }, []);

  const openLink = useCallback((url: string, options?: { try_instant_view?: boolean }) => {
    if (tg?.openLink) {
      tg.openLink(url, options);
    }
  }, [tg]);

  const showMainButton = useCallback((text: string) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
    }
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  }, [tg]);

  const showBackButton = useCallback(() => {
    if (tg?.BackButton && webAppVersion >= 6.1) {
      tg.BackButton.show();
    }
  }, [tg, webAppVersion]);

  const hideBackButton = useCallback(() => {
    if (tg?.BackButton && webAppVersion >= 6.1) {
      tg.BackButton.hide();
    }
  }, [tg, webAppVersion]);

  const showPopup = useCallback((params: PopupParams, callback?: (buttonId: string) => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showPopup(params, callback);
    }
  }, [tg, webAppVersion]);

  const showAlert = useCallback((message: string, callback?: () => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showAlert(message, callback);
    }
  }, [tg, webAppVersion]);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showConfirm(message, callback);
    }
  }, [tg, webAppVersion]);

  return {
    tg,
    user,
    theme,
    webAppVersion,
    isInTelegramContext,
    openLink,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showPopup,
    showAlert,
    showConfirm,
  };
}

export default useTelegram;