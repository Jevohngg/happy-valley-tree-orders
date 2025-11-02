import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  trees: Array<{
    speciesName: string;
    height: number;
    fullness: string;
    quantity: number;
    unitPrice: number;
    freshCut: boolean;
  }>;
  stands: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  wreaths: Array<{
    size: string;
    quantity: number;
    unitPrice: number;
  }>;
  deliveryOption: string;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const orderDetails: OrderDetails = await req.json();

    // Format trees list
    const treesList = orderDetails.trees
      .map(
        (tree) =>
          `  • ${tree.speciesName} - ${tree.height} ft (${tree.fullness}) × ${tree.quantity}${tree.freshCut ? ' - Fresh Cut' : ''}\n    $${tree.unitPrice.toFixed(2)} each = $${(tree.unitPrice * tree.quantity).toFixed(2)}`
      )
      .join("\n");

    // Format stands list
    const standsList = orderDetails.stands
      .map(
        (stand) =>
          `  • ${stand.name} × ${stand.quantity}\n    $${stand.unitPrice.toFixed(2)} each = $${(stand.unitPrice * stand.quantity).toFixed(2)}`
      )
      .join("\n");

    // Format wreaths list
    const wreathsList = orderDetails.wreaths
      .map(
        (wreath) =>
          `  • ${wreath.size} × ${wreath.quantity}\n    $${wreath.unitPrice.toFixed(2)} each = $${(wreath.unitPrice * wreath.quantity).toFixed(2)}`
      )
      .join("\n");

    const treesTotal = orderDetails.trees.reduce(
      (sum, tree) => sum + tree.unitPrice * tree.quantity,
      0
    );
    const standsTotal = orderDetails.stands.reduce(
      (sum, stand) => sum + stand.unitPrice * stand.quantity,
      0
    );
    const wreathsTotal = orderDetails.wreaths.reduce(
      (sum, wreath) => sum + wreath.unitPrice * wreath.quantity,
      0
    );

    // Build email content
    const emailBody = `
New Order Received - #${orderDetails.orderNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${orderDetails.customerName}
Email: ${orderDetails.customerEmail}
Phone: ${orderDetails.customerPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVERY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Address:
${orderDetails.deliveryAddress}

Preferred Date: ${orderDetails.deliveryDate}
Preferred Time: ${orderDetails.deliveryTime}
Delivery Option: ${orderDetails.deliveryOption}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER ITEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${orderDetails.trees.length > 0 ? `TREES:\n${treesList}\n\nTrees Subtotal: $${treesTotal.toFixed(2)}\n` : ''}${orderDetails.stands.length > 0 ? `\nSTANDS:\n${standsList}\n\nStands Subtotal: $${standsTotal.toFixed(2)}\n` : ''}${orderDetails.wreaths.length > 0 ? `\nWREATHS:\n${wreathsList}\n\nWreaths Subtotal: $${wreathsTotal.toFixed(2)}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRICING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Items Total: $${(treesTotal + standsTotal + wreathsTotal).toFixed(2)}
Delivery Fee: $${orderDetails.deliveryFee.toFixed(2)}

TOTAL: $${orderDetails.totalAmount.toFixed(2)}
${orderDetails.notes ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSPECIAL INSTRUCTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${orderDetails.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    // Using Resend API to send email
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Happy Valley Christmas Trees <orders@happyvalleytrees.com>',
        to: ['happyvalleychristmastrees@gmail.com'],
        subject: `New Order #${orderDetails.orderNumber} - ${orderDetails.customerName}`,
        text: emailBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        {
          status: res.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-order-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});