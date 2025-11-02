import { useState, useEffect } from 'react';
import { CheckCircle, Camera, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { OrderData } from '../App';

interface ReviewProps {
  orderData: OrderData;
  onConfirm: (orderNumber: string) => void;
  onSubmitReady: (submitFn: () => void) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function ReviewStep({ orderData, onConfirm, onSubmitReady, onSubmittingChange }: ReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    onSubmitReady(handleSubmit);
  }, []);

  const treesTotal = orderData.trees.reduce((sum, tree) => sum + (tree.unitPrice * tree.quantity), 0);
  const standsTotal = orderData.stands.reduce((sum, stand) => sum + (stand.unitPrice * stand.quantity), 0);
  const wreathsTotal = orderData.wreaths.reduce((sum, wreath) => sum + (wreath.unitPrice * wreath.quantity), 0);
  const deliveryFee = orderData.delivery.fee;
  const total = treesTotal + standsTotal + wreathsTotal + deliveryFee;

  async function handleSubmit() {
    setIsSubmitting(true);
    onSubmittingChange?.(true);

    try {
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          preferred_delivery_date: orderData.schedule.date,
          preferred_delivery_time: orderData.schedule.time,
          customer_first_name: orderData.contact.firstName,
          customer_last_name: orderData.contact.lastName,
          customer_email: orderData.contact.email,
          customer_phone: orderData.contact.phone,
          delivery_street: orderData.contact.street,
          delivery_unit: orderData.contact.unit,
          delivery_city: orderData.contact.city,
          delivery_state: orderData.contact.state,
          delivery_zip: orderData.contact.zip,
          delivery_option_id: orderData.delivery.id,
          delivery_fee: orderData.delivery.fee,
          total_amount: total,
          status: 'pending',
          notes: orderData.contact.notes || null,
        })
        .select('id, order_number')
        .single();

      if (orderError || !orderResult) {
        console.error('Error creating order:', orderError);
        alert(`Error submitting order: ${orderError?.message || 'Unknown error'}. Please try again.`);
        setIsSubmitting(false);
        onSubmittingChange?.(false);
        return;
      }

      const orderId = orderResult.id;
      const orderNumber = orderResult.order_number;

      const treeInserts = orderData.trees.map(tree => ({
        order_id: orderId,
        species_id: tree.speciesId,
        fullness_type: tree.fullness,
        height_feet: tree.height,
        unit_price: tree.unitPrice,
        quantity: tree.quantity,
        fresh_cut: tree.freshCut,
      }));

      const standInserts = orderData.stands.map(stand => ({
        order_id: orderId,
        stand_id: stand.id,
        unit_price: stand.unitPrice,
        quantity: stand.quantity,
        is_own_stand: stand.hasOwn,
      }));

      const wreathInserts = orderData.wreaths.map(wreath => ({
        order_id: orderId,
        wreath_id: wreath.id,
        unit_price: wreath.unitPrice,
        quantity: wreath.quantity,
      }));

      const insertPromises = [];

      if (treeInserts.length > 0) {
        insertPromises.push(supabase.from('order_trees').insert(treeInserts));
      }

      if (standInserts.length > 0) {
        insertPromises.push(supabase.from('order_stands').insert(standInserts));
      }

      if (wreathInserts.length > 0) {
        insertPromises.push(supabase.from('order_wreaths').insert(wreathInserts));
      }

      const results = await Promise.all(insertPromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        console.error('Error inserting order items:', results);
        alert('Error submitting order items. Please try again.');
        setIsSubmitting(false);
        onSubmittingChange?.(false);
        return;
      }

      // Send email notification
      try {
        const deliveryAddress = [
          orderData.contact.street,
          orderData.contact.unit,
          `${orderData.contact.city}, ${orderData.contact.state} ${orderData.contact.zip}`
        ].filter(Boolean).join('\n');

        console.log('Sending email notification for order:', orderNumber);

        const emailResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderNumber,
              customerName: `${orderData.contact.firstName} ${orderData.contact.lastName}`,
              customerEmail: orderData.contact.email,
              customerPhone: orderData.contact.phone,
              deliveryAddress,
              deliveryDate: new Date(orderData.schedule.date).toLocaleDateString(),
              deliveryTime: orderData.schedule.time || 'Not specified',
              trees: orderData.trees,
              stands: orderData.stands,
              wreaths: orderData.wreaths,
              deliveryOption: orderData.delivery.name,
              deliveryFee: orderData.delivery.fee,
              totalAmount: total,
              notes: orderData.contact.notes,
            }),
          }
        );

        const responseText = await emailResponse.text();
        console.log('Email notification response status:', emailResponse.status);
        console.log('Email notification response:', responseText);

        if (!emailResponse.ok) {
          console.error('Failed to send email notification. Status:', emailResponse.status);
          console.error('Response:', responseText);
        } else {
          console.log('✓ Email notification sent successfully!');
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the order if email fails
      }

      onConfirm(orderNumber);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert(`There was an error submitting your order: ${error.message || 'Unknown error'}. Please try again.`);
      setIsSubmitting(false);
      onSubmittingChange?.(false);
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-2xl mx-auto md:px-4 md:py-8">
        <div className="bg-white md:border md:rounded md:border-slate-200 overflow-hidden p-4 md:p-6 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">Review Your Order</h2>
            <p className="text-sm md:text-base text-slate-600">Please review your order before confirming</p>
          </div>

          <div className="space-y-4">
            {orderData.trees.length > 0 && (
              <div className="bg-slate-50 border rounded border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Trees</h3>
                <div className="space-y-3">
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
                  <div className="pt-3 border-t border-slate-300 flex justify-between text-sm font-semibold">
                    <span>Trees Subtotal</span>
                    <span>${treesTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {orderData.stands.length > 0 && (
              <div className="bg-slate-50 border rounded border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Stands</h3>
                <div className="space-y-3">
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
                  <div className="pt-3 border-t border-slate-300 flex justify-between text-sm font-semibold">
                    <span>Stands Subtotal</span>
                    <span>${standsTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {orderData.wreaths.length > 0 && (
              <div className="bg-slate-50 border rounded border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Wreaths</h3>
                <div className="space-y-3">
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
                  <div className="pt-3 border-t border-slate-300 flex justify-between text-sm font-semibold">
                    <span>Wreaths Subtotal</span>
                    <span>${wreathsTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border rounded border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Delivery</h3>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium text-slate-900">{orderData.delivery.name}</div>
                  {orderData.schedule.date && (
                    <div className="text-slate-600">
                      Preferred: {new Date(orderData.schedule.date).toLocaleDateString()}
                      {orderData.schedule.time && ` at ${orderData.schedule.time}`}
                    </div>
                  )}
                </div>
                <div className="font-semibold text-slate-900">${deliveryFee.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-slate-50 border rounded border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Delivery Address</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <div className="font-medium text-slate-900">{orderData.contact.firstName} {orderData.contact.lastName}</div>
                <div>{orderData.contact.street}</div>
                {orderData.contact.unit && <div>{orderData.contact.unit}</div>}
                <div>{orderData.contact.city}, {orderData.contact.state} {orderData.contact.zip}</div>
                <div className="pt-2">{orderData.contact.email}</div>
                <div>{orderData.contact.phone}</div>
              </div>
            </div>

            {orderData.contact.notes && (
              <div className="bg-slate-50 border rounded border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Special Instructions</h3>
                <div className="text-sm text-slate-600 whitespace-pre-wrap">{orderData.contact.notes}</div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center text-xl font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfirmationProps {
  orderNumber: string;
  orderData: OrderData;
}

export function ConfirmationScreen({ orderNumber, orderData }: ConfirmationProps) {
  const treesTotal = orderData.trees.reduce((sum, tree) => sum + (tree.unitPrice * tree.quantity), 0);
  const standsTotal = orderData.stands.reduce((sum, stand) => sum + (stand.unitPrice * stand.quantity), 0);
  const wreathsTotal = orderData.wreaths.reduce((sum, wreath) => sum + (wreath.unitPrice * wreath.quantity), 0);
  const deliveryFee = orderData.delivery.fee;
  const total = treesTotal + standsTotal + wreathsTotal + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white border rounded-lg border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-4 py-3 text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Order Confirmed!</h1>
            <p className="text-sm text-slate-600 mt-1">Order #{orderNumber}</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <p className="text-xs text-amber-900 font-medium">
                Screenshot this page to keep it for your records
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase text-slate-500 tracking-wide">Order Summary</h3>

              {orderData.trees.length > 0 && (
                <div className="text-xs space-y-1">
                  {orderData.trees.map((tree, index) => (
                    <div key={index} className="flex justify-between text-slate-700">
                      <span>{tree.speciesName} {tree.height}ft ({tree.fullness}) × {tree.quantity}</span>
                      <span className="font-medium">${(tree.unitPrice * tree.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {orderData.stands.length > 0 && (
                <div className="text-xs space-y-1">
                  {orderData.stands.map((stand, index) => (
                    <div key={index} className="flex justify-between text-slate-700">
                      <span>{stand.name} × {stand.quantity}</span>
                      <span className="font-medium">${(stand.unitPrice * stand.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {orderData.wreaths.length > 0 && (
                <div className="text-xs space-y-1">
                  {orderData.wreaths.map((wreath, index) => (
                    <div key={index} className="flex justify-between text-slate-700">
                      <span>{wreath.size} × {wreath.quantity}</span>
                      <span className="font-medium">${(wreath.unitPrice * wreath.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs flex justify-between text-slate-700">
                <span>Delivery</span>
                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-xs text-slate-700">
                <div className="font-semibold text-slate-900">{orderData.contact.firstName} {orderData.contact.lastName}</div>
                <div>{orderData.contact.street}</div>
                {orderData.contact.unit && <div>{orderData.contact.unit}</div>}
                <div>{orderData.contact.city}, {orderData.contact.state} {orderData.contact.zip}</div>
                <div className="mt-1">{orderData.contact.phone}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-3 text-xs text-slate-600">
              <div>
                <div className="font-semibold text-slate-900 mb-1">Delivery Coordination</div>
                <p>While we do our best to accommodate your preferred date and time, delivery windows are not guaranteed. A team member will personally call or text you in advance to confirm and coordinate your delivery.</p>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Tree Appearance & Availability</div>
                <p>Every tree is unique. Shape, fullness, and overall appearance may vary based on seasonal availability and natural differences between trees. We'll always do our best to match your selected type and fullness as closely as possible.</p>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Pricing & Estimates</div>
                <p>All prices shown are estimates and may vary slightly depending on final tree selection, availability, and any add-ons chosen at delivery. You will be informed of any adjustments before payment.</p>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Payment Terms</div>
                <p>Payment is due upon delivery. The estimated total does not include gratuity for the delivery team.</p>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Accepted Payment Methods</div>
                <p>We accept cash or Venmo payments at the time of delivery.</p>
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">Have Questions?</div>
                <p>Contact us at (801)-244-9156</p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 rounded-lg transition-colors"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
