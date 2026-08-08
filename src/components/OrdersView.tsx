import React from 'react';
import { Order } from '../types';
import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  phone: string;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, phone }) => {
  const userOrders = orders.filter((o) => o.customer_phone === phone || !phone);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-[70vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" /> My WhatsApp Orders
        </h2>
        {phone && (
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
            +{phone}
          </span>
        )}
      </div>

      {userOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs p-6">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-sm mb-1">No orders yet</h3>
          <p className="text-xs text-slate-500 font-medium">Your placed orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userOrders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <div className="font-black text-slate-900 text-xs">{order.order_id}</div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {new Date(order.order_time).toLocaleString()}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items Summary */}
              <div className="text-xs font-semibold text-slate-600 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.qty}x {item.name}
                    </span>
                    <span className="font-bold text-slate-800">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-500 italic">
                  Note: {order.notes}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-black">
                <span className="text-slate-500">Total Amount Paid</span>
                <span className="text-emerald-600 text-sm">₹{order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
