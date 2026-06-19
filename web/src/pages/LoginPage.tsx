import { FormEvent, useMemo, useState } from 'react';
import { Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { login, sendCode } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { message } from '@/utils/message';

interface LoginPageProps {
  compact?: boolean;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}

function validatePhone(phone: string) {
  return /^1\d{10}$/.test(phone);
}

export function LoginPage({ compact = false }: LoginPageProps) {
  const setSession = useAuthStore((state) => state.setSession);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const canSendCode = useMemo(() => validatePhone(phone) && !sendingCode, [phone, sendingCode]);
  const canLogin = validatePhone(phone) && code.trim().length > 0 && !loggingIn;

  async function handleSendCode() {
    if (!validatePhone(phone)) {
      message.warning('请输入 11 位手机号');
      return;
    }

    setSendingCode(true);
    try {
      await sendCode({ mobile: phone });
      message.success('验证码已发送');
    } catch (error) {
      const content = error instanceof Error ? error.message : '验证码发送失败';
      message.error(content);
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canLogin) {
      message.warning('请输入手机号和验证码');
      return;
    }

    setLoggingIn(true);
    try {
      const session = await login({ mobile: phone, code: code.trim() });
      setSession(session.token, session.user);
      message.success('登录成功');
    } catch (error) {
      const content = error instanceof Error ? error.message : '登录失败';
      message.error(content);
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <section
      className={`mx-auto flex w-full max-w-[430px] flex-col px-6 ${
        compact ? 'pb-4 pt-4' : 'min-h-screen pb-8 pt-[max(42px,env(safe-area-inset-top))]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">帮涂用户端</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950">手机号登录</h1>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-soft">
          <ShieldCheck size={24} strokeWidth={2.4} />
        </div>
      </div>

      <div className={`${compact ? 'mt-6' : 'mt-10'} rounded-[28px] border border-blue-100 bg-white p-5 shadow-soft`}>
        <div className="flex items-center gap-3 rounded-3xl bg-blue-50/70 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-600">
            <Smartphone size={22} strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-950">快捷验证码</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">后端接入后使用真实短信验证码，当前验证码可填 1。</p>
          </div>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">手机号</span>
            <input
              className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[17px] font-semibold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(event) => setPhone(normalizePhone(event.target.value))}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">验证码</span>
            <div className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-blue-100">
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-[17px] font-semibold text-slate-950 outline-none placeholder:text-slate-300"
                inputMode="numeric"
                placeholder="填写验证码"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button
                className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-brand-600 transition enabled:hover:bg-blue-50 disabled:text-slate-300"
                type="button"
                disabled={!canSendCode}
                onClick={handleSendCode}
              >
                {sendingCode ? '发送中' : '获取验证码'}
              </button>
            </div>
          </label>

          <button
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-semibold text-white shadow-soft transition enabled:active:scale-[0.98] enabled:hover:bg-brand-700 disabled:bg-slate-300"
            type="submit"
            disabled={!canLogin}
          >
            {loggingIn ? <Loader2 className="animate-spin" size={20} /> : null}
            登录
          </button>
        </form>
      </div>

      <p className={`${compact ? 'pt-5' : 'mt-auto pt-8'} text-center text-xs leading-5 text-slate-400`}>
        登录即表示你同意平台服务规则，用户信息仅用于当前服务流程。
      </p>
    </section>
  );
}
