import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/contexts/app-context';
import { supabase } from '@/lib/supabase';
import type {
  TelegramWebApp,
  WebAppUser,
  PopupParams,
} from '@/types/telegram';

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
  const { dispatch } = useApp();
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [webAppVersion, setWebAppVersion] = useState<number>(0);
  const [isInTelegramContext, setIsInTelegramContext] = useState(false);

  const upsertUser = async (user_id: string, username: string, lang: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            user_id,
            username,
            full_name: username || null,
            language_code: lang,
            status: 'free',
            role: 'attendee',
          },
          { onConflict: 'user_id' }
        )
        .select('*')
        .single();

      if (error) throw error;

      dispatch({ type: 'SET_USER', payload: data });
    } catch (error) {
      console.error('User upsert error:', error);
    }
  };

  const handleBackButton = useCallback(() => {
    if (onBackButtonPressed) {
      onBackButtonPressed();
    } else if (tg && webAppVersion >= 6.1) {
      tg.close();
    }
  }, [onBackButtonPressed, tg, webAppVersion]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !tg) {
      const scriptId = 'telegram-web-app-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          if (window.Telegram?.WebApp) {
            const tgWebApp = window.Telegram.WebApp;
            tgWebApp.ready();
            setTg(tgWebApp);
            setWebAppVersion(parseFloat(tgWebApp.version));
            setIsInTelegramContext(true);

            const user = tgWebApp.initDataUnsafe?.user || mockUser;
            const userId = user.id.toString(); // Ensure ID is a string
            upsertUser(userId, user.username || user.first_name, user.language_code || 'en');
            setTheme(tgWebApp.colorScheme);
          } else {
            setIsInTelegramContext(false);
          }
        };
      }
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

  const setHeaderColor = useCallback((color: string) => {
    if (tg && webAppVersion >= 6.1) {
      tg.setHeaderColor(color);
    }
  }, [tg, webAppVersion]);

  const setBackgroundColor = useCallback((color: string) => {
    if (tg && webAppVersion >= 6.1) {
      tg.setBackgroundColor(color);
    }
  }, [tg, webAppVersion]);

  const setBottomBarColor = useCallback((color: string) => {
    if (tg && webAppVersion >= 6.1) {
      tg.setBottomBarColor(color);
    }
  }, [tg, webAppVersion]);

  const enableVerticalSwipes = useCallback(() => {
    if (tg && webAppVersion >= 6.1) {
      tg.enableVerticalSwipes();
    }
  }, [tg, webAppVersion]);

  const disableVerticalSwipes = useCallback(() => {
    if (tg && webAppVersion >= 6.1) {
      tg.disableVerticalSwipes();
    }
  }, [tg, webAppVersion]);
  
  const openLink = useCallback(
    (url: string, options?: { try_instant_view?: boolean }) => {
      if (tg?.openLink) {
        tg.openLink(url, options);
      } else {
        console.warn('openLink is not supported in this environment.');
      }
    },
    [tg]
  );
  
  const openTelegramLink = useCallback(
    (url: string) => {
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
      } else {
        console.warn('openTelegramLink is not supported in this environment.');
      }
    },
    [tg]
  );

  const openInvoice = useCallback(
    (url: string, callback?: (status: string) => void) => {
      if (tg?.openInvoice) {
        tg.openInvoice(url, callback);
      } else {
        console.warn('openInvoice is not supported in this environment.');
      }
    },
    [tg]
  );

  const shareToStory = useCallback(
    (mediaUrl: string, params?: { [key: string]: any }) => {
      if (tg?.shareToStory) {
        tg.shareToStory(mediaUrl, params);
      } else {
        console.warn('shareToStory is not supported in this environment.');
           
          
      }
    },
    [tg]
  );

  const shareMessage = useCallback(
    (msgId: string, callback?: (success: boolean) => void) => {
      if (tg?.shareMessage) {
        tg.shareMessage(msgId, callback);
      } else {
        console.warn('shareMessage is not supported in this environment.');
      }
    },
    [tg]
  );

  const expand = useCallback(() => {
    if (tg?.expand) {
      tg.expand();
    } else {
      console.warn('expand is not supported in this environment.');
    }
  }, [tg]);

  const getUserIdAsString = useCallback(() => {
    if (tg?.initDataUnsafe?.user?.id) {
      return tg.initDataUnsafe.user.id.toString(); // Ensure ID is a string
    }
    return null;
  }, [tg]);
  
  return {
    tg,
    theme,
    webAppVersion,
    isInTelegramContext,
    handleBackButton,
    openLink,
    openTelegramLink,
    openInvoice,
    shareToStory,
    shareMessage,
    expand,
    getUserIdAsString,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showPopup,
    showAlert,
    showConfirm,
    setHeaderColor,
    setBackgroundColor,
    setBottomBarColor,
    enableVerticalSwipes,
    disableVerticalSwipes,
  };
}
