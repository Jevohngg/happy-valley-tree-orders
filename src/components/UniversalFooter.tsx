import { useState } from 'react';
import { ArrowLeft, ArrowRight, X, ShoppingCart, Loader2 } from 'lucide-react';
import { TreeItem, StandItem, WreathItem, OrderData } from '../App';

interface UniversalFooterProps {
  orderData: Partial<OrderData>;
  canGoBack: boolean;
  canGoNext: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isLoading?: boolean;
}

export function UniversalFooter({
  orderData,
  canGoBack,
  canGoNext,
  onBack,
  onNext,
  nextLabel = 'Next',
  isLoading = false,
}: UniversalFooterProps) {
  const [showSummary, setShowSummary] = useState(false);

  const treesTotal = (orderData.trees || []).reduce((sum, tree) => sum + (tree.unitPrice * tree.quantity), 0);
  const standsTotal = (orderData.stands || []).reduce((sum, stand) => sum + (stand.unitPrice * stand.quantity), 0);
  const wreathsTotal = (orderData.wreaths || []).reduce((sum, wreath) => sum + (wreath.unitPrice * wreath.quantity), 0);
  const deliveryFee = orderData.delivery?.fee || 0;
  const total = treesTotal + standsTotal + wreathsTotal + deliveryFee;

  const totalItems =
    (orderData.trees || []).reduce((sum, tree) => sum + tree.quantity, 0) +
    (orderData.stands || []).reduce((sum, stand) => sum + stand.quantity, 0) +
    (orderData.wreaths || []).reduce((sum, wreath) => sum + wreath.quantity, 0);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={() => setShowSummary(true)}
              className="flex items-center gap-1.5 sm:gap-2 hover:bg-slate-50 px-2 py-1.5 rounded transition-colors min-w-0"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-slate-900">${total.toFixed(2)}</span>
                  {totalItems > 0 && (
                    <span className="text-xs text-slate-600">({totalItems})</span>
                  )}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {canGoBack && onBack && (
                <button
                  onClick={onBack}
                  className="px-3 sm:px-4 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 rounded transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                disabled={!canGoNext || isLoading}
                className="px-4 sm:px-6 py-1.5 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Order Summary</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {orderData.trees && orderData.trees.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Trees</h4>
                  <div className="space-y-2">
                    {orderData.trees.map((tree, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">
                            {tree.speciesName} - {tree.height} ft ({tree.fullness})
                          </div>
                          <div className="text-slate-600">
                            ${tree.pricePerFoot.toFixed(2)}/ft × {tree.height} ft × {tree.quantity}
                            {tree.freshCut && <span className="text-green-600"> • Fresh Cut</span>}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">
                          ${(tree.unitPrice * tree.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-semibold">
                      <span>Trees Subtotal</span>
                      <span>${treesTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {orderData.stands && orderData.stands.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Stands</h4>
                  <div className="space-y-2">
                    {orderData.stands.map((stand, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{stand.name}</div>
                          <div className="text-slate-600">
                            {stand.hasOwn ? 'No charge' : `$${stand.unitPrice.toFixed(2)} × ${stand.quantity}`}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">
                          ${(stand.unitPrice * stand.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-semibold">
                      <span>Stands Subtotal</span>
                      <span>${standsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {orderData.wreaths && orderData.wreaths.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Wreaths</h4>
                  <div className="space-y-2">
                    {orderData.wreaths.map((wreath, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{wreath.size}</div>
                          <div className="text-slate-600">
                            ${wreath.unitPrice.toFixed(2)} × {wreath.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">
                          ${(wreath.unitPrice * wreath.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-semibold">
                      <span>Wreaths Subtotal</span>
                      <span>${wreathsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {orderData.delivery && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Delivery</h4>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium text-slate-900">{orderData.delivery.name}</div>
                      {orderData.schedule?.date && (
                        <div className="text-slate-600">
                          Preferred: {new Date(orderData.schedule.date).toLocaleDateString()}
                          {orderData.schedule.time && ` at ${orderData.schedule.time}`}
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900">${deliveryFee.toFixed(2)}</div>
                  </div>
                </div>
              )}

              {orderData.contact && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Delivery Address</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="font-medium text-slate-900">
                      {orderData.contact.firstName} {orderData.contact.lastName}
                    </div>
                    <div>{orderData.contact.street}</div>
                    {orderData.contact.unit && <div>{orderData.contact.unit}</div>}
                    <div>
                      {orderData.contact.city}, {orderData.contact.state} {orderData.contact.zip}
                    </div>
                    <div className="pt-2">{orderData.contact.email}</div>
                    <div>{orderData.contact.phone}</div>
                  </div>
                </div>
              )}

              {(orderData.trees?.length || 0) === 0 &&
                (orderData.stands?.length || 0) === 0 &&
                (orderData.wreaths?.length || 0) === 0 &&
                !orderData.delivery &&
                !orderData.contact && (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm mt-1">Start adding items to your order</p>
                  </div>
                )}

              <div className="pt-4 border-t-2 border-slate-300">
                <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowSummary(false)}
                className="w-full py-2.5 bg-slate-900 text-white font-medium hover:bg-slate-800 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
