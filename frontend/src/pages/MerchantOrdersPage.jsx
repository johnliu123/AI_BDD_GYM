import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createMerchantOrderApi } from '../merchantOrderApi.js';

const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'created', label: '已建立' },
  { value: 'accepted', label: '已接單' },
  { value: 'preparing', label: '出餐中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const PAYMENT_OPTIONS = [
  { value: '', label: '全部付款' },
  { value: 'unpaid', label: '未付款' },
  { value: 'paid', label: '已付款' },
  { value: 'failed', label: '付款失敗' },
  { value: 'refunded', label: '已退款' },
];

export default function MerchantOrdersPage({ merchantToken }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [detail, setDetail] = useState(null);
  const [listError, setListError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const mountedRef = useRef(true);
  const listGenerationRef = useRef(0);
  const detailTargetRef = useRef(null);
  const toastTimerRef = useRef(null);

  const api = useMemo(() => createMerchantOrderApi(fetch, { merchantToken }), [merchantToken]);
  const showProdCredentialHint = !import.meta.env.DEV && !merchantToken;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    if (!mountedRef.current) {
      return;
    }
    setToast(message);
    toastTimerRef.current = setTimeout(() => {
      toastTimerRef.current = null;
      if (mountedRef.current) {
        setToast('');
      }
    }, 2200);
  }, []);

  const loadList = useCallback(async () => {
    const generation = ++listGenerationRef.current;
    if (!mountedRef.current) {
      return;
    }
    setBusy(true);
    setListError('');
    try {
      const payload = await api.listOrders({
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      });
      if (!mountedRef.current || generation !== listGenerationRef.current) {
        return;
      }
      setOrders(payload.orders);
    } catch (error) {
      if (!mountedRef.current || generation !== listGenerationRef.current) {
        return;
      }
      if (error.code === 'MERCHANT_UNAUTHORIZED' || error.code === 'MERCHANT_NOT_CONFIGURED') {
        setListError('店家憑證無效或未設定，無法載入訂單。');
      } else {
        setListError('無法載入訂單列表，請稍後再試。');
      }
      setOrders([]);
    } finally {
      if (mountedRef.current && generation === listGenerationRef.current) {
        setBusy(false);
      }
    }
  }, [api, statusFilter, paymentFilter]);

  const loadDetail = useCallback(
    async (orderNumber) => {
      detailTargetRef.current = orderNumber;
      if (!mountedRef.current) {
        return;
      }
      setDetailError('');
      try {
        const payload = await api.getOrder(orderNumber);
        if (!mountedRef.current || detailTargetRef.current !== orderNumber) {
          return;
        }
        setDetail(payload.order);
      } catch (error) {
        if (!mountedRef.current || detailTargetRef.current !== orderNumber) {
          return;
        }
        setDetail(null);
        setDetailError(error.code === 'ORDER_NOT_FOUND' ? '找不到訂單。' : '無法載入訂單詳情。');
      }
    },
    [api]
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedNumber) {
      detailTargetRef.current = null;
      return;
    }
    loadDetail(selectedNumber);
  }, [selectedNumber, loadDetail]);

  const runAction = async (action) => {
    if (!selectedNumber) {
      return;
    }
    setBusy(true);
    try {
      const handlers = {
        accept: () => api.acceptOrder(selectedNumber),
        preparing: () => api.startPreparing(selectedNumber),
        complete: () => api.completeOrder(selectedNumber),
      };
      await handlers[action]();
      await loadList();
      await loadDetail(selectedNumber);
    } catch (error) {
      if (error.code === 'ORDER_STATUS_CONFLICT') {
        showToast('訂單狀態已變更，請重新整理後再試。');
        await loadList();
        await loadDetail(selectedNumber);
      } else {
        showToast('操作失敗，請稍後再試。');
      }
    } finally {
      if (mountedRef.current) {
        setBusy(false);
      }
    }
  };

  if (showProdCredentialHint) {
    return (
      <section className="merchant-board" aria-label="店家訂單看板">
        <h2>店家訂單看板</h2>
        <p className="cart-error" role="alert">
          正式環境請由反向代理或內網後台注入店家憑證；請勿在 production build 設定 VITE_MERCHANT_TOKEN（會暴露於瀏覽器）。
        </p>
      </section>
    );
  }

  return (
    <section className="merchant-board" aria-label="店家訂單看板">
      <header className="merchant-board__header">
        <h2>店家訂單看板</h2>
        <label className="merchant-board__filter">
          狀態篩選
          <select
            value={statusFilter}
            disabled={busy}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setSelectedNumber(null);
              setDetail(null);
              detailTargetRef.current = null;
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="merchant-board__filter">
          付款篩選
          <select
            value={paymentFilter}
            disabled={busy}
            onChange={(event) => {
              setPaymentFilter(event.target.value);
              setSelectedNumber(null);
              setDetail(null);
              detailTargetRef.current = null;
            }}
          >
            {PAYMENT_OPTIONS.map((option) => (
              <option key={option.value || 'all-pay'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="action-button" disabled={busy} onClick={loadList}>
          重新整理
        </button>
      </header>

      {listError && (
        <p className="cart-error" role="alert">
          {listError}
        </p>
      )}

      <div className="merchant-board__layout">
        <ul className="merchant-board__list">
          {orders.map((order) => (
            <li key={order.order_number}>
              <button
                type="button"
                className={selectedNumber === order.order_number ? 'selected' : ''}
                onClick={() => setSelectedNumber(order.order_number)}
              >
                <span>{order.order_number}</span>
                <span>{order.status_label}</span>
                <span>{order.payment_status_label ?? order.payment_status}</span>
                <span>NT$ {order.total}</span>
              </button>
            </li>
          ))}
          {!listError && orders.length === 0 && !busy && <li className="merchant-board__empty">目前沒有訂單。</li>}
        </ul>

        <article className="merchant-board__detail">
          {!selectedNumber && <p>請從左側選擇訂單以查看明細。</p>}
          {detailError && (
            <p className="cart-error" role="alert">
              {detailError}
            </p>
          )}
          {detail && (
            <>
              <h3>{detail.order_number}</h3>
              <p>
                出餐狀態：{detail.status_label}（{detail.status}）
              </p>
              <p>
                付款狀態：{detail.payment_status_label ?? detail.payment_status}
              </p>
              {detail.payment_failure_reason && (
                <p>付款失敗：{detail.payment_failure_reason}</p>
              )}
              <p>總金額：NT$ {detail.total}</p>
              <ul>
                {detail.items.map((item) => (
                  <li key={`${item.menu_item_id}-${item.menu_item_name}`}>
                    {item.menu_item_name} × {item.quantity} — NT$ {item.line_total}
                  </li>
                ))}
              </ul>
              {detail.status !== 'cancelled' && (
                <div className="merchant-board__actions">
                  {detail.status === 'created' && (
                    <button type="button" className="action-button" disabled={busy} onClick={() => runAction('accept')}>
                      接單
                    </button>
                  )}
                  {detail.status === 'accepted' && (
                    <button type="button" className="action-button" disabled={busy} onClick={() => runAction('preparing')}>
                      開始出餐
                    </button>
                  )}
                  {detail.status === 'preparing' && (
                    <button type="button" className="action-button" disabled={busy} onClick={() => runAction('complete')}>
                      完成訂單
                    </button>
                  )}
                </div>
              )}
              {detail.status === 'cancelled' && (
                <p className="merchant-board__hint" role="status">
                  此訂單已取消，無法接單或推進出餐。
                </p>
              )}
            </>
          )}
        </article>
      </div>

      {toast && <p className="merchant-board__toast" role="status">{toast}</p>}
    </section>
  );
}
