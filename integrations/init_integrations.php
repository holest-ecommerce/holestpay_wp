<?php
//HOLESTPAY 2023
if(!function_exists("add_action")){
	die("Direct access is not allowed");
};

add_filter( 'cartflows_offer_supported_payment_gateways', 'hpay_add_cartflows_offer_support' );

/**
 * Add new payment gateway in cartflows pro Supported Gateways.
 *
 * @param array $supported_gateways Supported Gateways by CartFlows.
 * @return array.
 */
function hpay_add_cartflows_offer_support( $supported_gateways ){
	try{
		$hmethods = HPay_Core::payment_methods_enabled();
		if(!empty($hmethods)){
			foreach($hmethods as $hmethod){
				
				$supported_gateways[$hmethod->id] = array(
					'file'  => 'class-cartflows-pro-gateway-hpay.php', // Your Custom code's file name
					'class' => 'Cartflows_Pro_Gateway_Hpay',   // Class name used in the Custom Code's file.
					'path'  => __DIR__ . DIRECTORY_SEPARATOR . "cartflowspro". DIRECTORY_SEPARATOR . "class-cartflows-pro-gateway-hpay.php", // Full directory path of the custom code's file.
				);
				
			}
		}
	}catch(Throwable $ex){
		//
	}
	return $supported_gateways; 
}

add_filter( "woocommerce_currency_symbols" ,"hpay_fix_currency_registry" ,70 ,1);
add_filter( "woocommerce_currency_symbol"  ,"hpay_fix_currency_symbol"   ,70 ,2);

function hpay_fix_currency_registry($symbols) {
	$symbols["RSD"] = __("RSD","holestpay");
	$symbols["BAM"] = __("BAM","holestpay");
	$symbols["MKD"] = __("MKD","holestpay");
	return $symbols;
}

function hpay_fix_currency_symbol( $symbol, $currency ) {
	
	if(stripos($currency,"rsd") === 0 || stripos($currency,"рсд") === 0 || stripos($currency,"din") === 0 || stripos($currency,"дин") === 0)
		return __("RSD","holestpay");
	
	if(stripos($currency,"bam") === 0 || stripos($currency,"km") === 0 || stripos($currency,"km") === 0)
		return __("BAM","holestpay");
	
	if(stripos($currency,"ден") !== false || stripos($currency,"den") !== false || stripos($currency,"mkd") !== false || stripos($currency,"мкд") !== false ){
		return __("MKD","holestpay");
	}
	
	return $symbol;
}

function hpay_tos_in_new_tab_shortcode( $atts ) {
	// Definisanje podrazumevanih atributa (hpaymodal je po defaultu "0")
	$attributes = shortcode_atts( array(
		'hpaymodal' => '0',
	), $atts );

	// Početak buffering-a
	ob_start();
	?>
	<script type="text/javascript">
		jQuery(document).ready(function() {
			// Prvi deo koda koji se uvek izvršava (striktno jQuery umesto $)
			jQuery(document).on("mouseenter", '.woocommerce-terms-and-conditions-link', function(e){  
				jQuery(this).removeClass('woocommerce-terms-and-conditions-link').addClass("site-purchase-tos-open"); 
			});

			// Provera da li je hpaymodal postavljen na "1"
			<?php if ( $attributes['hpaymodal'] === '1' ) : ?>
				jQuery(document).on('click', '.site-purchase-tos-open', async function(e){ 
					if (jQuery(".woocommerce-terms-and-conditions")[0]) {
						e.preventDefault();
					} else {
						return;
					}
					
					if(typeof hpay_dialog_open === 'undefined'){
						await HPayInit();
						await HPay.loadHPayUI();
					}
					
					// Pozivanje hpay_dialog_open funkcije
					hpay_dialog_open(
						"site-tos", 
						" ",  
						"<div style='padding:20px'>" + jQuery(".woocommerce-terms-and-conditions").html() + '</div>',
						'large', 
						{ 
							"OK": { 
								Run: (dlg) => { dlg.close(); }
							}
						}
					);
				});
			<?php endif; ?>
		});
	</script>
	<?php
	return ob_get_clean();
}
add_shortcode( 'hpay_tos_in_new_tab', 'hpay_tos_in_new_tab_shortcode' );

function hpay_no_default_payment_method_shortcode() {
	ob_start();
	?>
	<script type="text/javascript">
		jQuery(document).ready(function() {
		// Sprečavamo duplo bindovanje ako se shortcode renderuje više puta
		if (typeof window.hpay_no_default_initialized !== 'undefined') {
			return;
		}
		window.hpay_no_default_initialized = true;
		
		window.userSelectedMethod_by_act = null;

		function enforcePaymentSelection() {
			if (window.userSelectedMethod_by_act !== null) {
				// Ako je korisnik izabrao metodu, pronađi njen input nakon AJAX osvežavanja
				var activeInput = jQuery('input[name="payment_method"][value="' + window.userSelectedMethod_by_act + '"]');
				
				if (activeInput.length) {
					// Čekiramo input BEZ .trigger('change') da ne bismo izazvali beskonačnu AJAX petlju sa Woo-om
					activeInput.prop('checked', true);
					
					// WooCommerce zahteva da i roditeljski kontejner dobije klasu 'active' i da se prikaže payment_box
					var parentLi = activeInput.closest('.wc_payment_method');
					parentLi.addClass('active');
					parentLi.find('.payment_box').show();
				}
			} else {
				// Ako korisnik još ništa nije kliknuo, skini selekciju sa svih i sakrij opise
				jQuery('input[name="payment_method"]').prop('checked', false);
				jQuery('.wc_payment_method').removeClass('active').find('.payment_box').hide();
			}
		}

		// Hvata klik na ceo kontejner/labelu platne metode
		jQuery(document).on('click', '.wc_payment_method', function(e) {
			var radio = jQuery(this).find('input[name="payment_method"]');
			if (radio.length) {
				window.userSelectedMethod_by_act = radio.val();
			}
		});
		
		// ISPRAVLJENO: promenjeno sa 'changek' na 'change' za direktne izmene na inputu
		jQuery(document).on('change', 'input[name="payment_method"]', function(e) {
			window.userSelectedMethod_by_act = this.value;
		});

		// Kada WooCommerce završi osvežavanje checkout-a zbog promene grada/države
		jQuery(document).on('init_checkout updated_checkout', function() {
			enforcePaymentSelection();
			// Kratki tajmauti jer WooCommerce skripte znaju da pregaze stanje milisekund nakon okidanja eventa
			setTimeout(enforcePaymentSelection, 50);
			setTimeout(enforcePaymentSelection, 150);
		});

		// Prvo pokretanje pri učitavanju stranice
		enforcePaymentSelection();
		setTimeout(enforcePaymentSelection, 300);
	});
	</script>
	<?php
	return ob_get_clean();
}
add_shortcode( 'hpay_no_default_payment_method', 'hpay_no_default_payment_method_shortcode' );

function hpay_order_details_shortcode( $atts, $content = null ) {
	// 1. Definisanje podrazumevanih argumenata shortcode-a
	$args = shortcode_atts( array(
		'only_thankyou'       => '1',
		'show_items'          => '1',
		'show_billing'        => '1',
		'show_shipping'       => '1',
		'show_payment_method' => '1',
		'show_shipping_method'=> '1',
		'text_before_success' => '',
		'text_after_success'  => '',
		'text_before_failed'  => '',
		'text_after_failed'   => '',
	), $atts );

	// Provera da li smo na Thank You stranici ako je only_thankyou uključen
	if ( $args['only_thankyou'] === '1' && ! is_order_received_page() ) {
		return '';
	}

	// 2. Pronalaženje Order ID-ja iz konteksta
	$order_id = 0;
	global $wp;

	if ( isset( $wp->query_vars['order-received'] ) ) {
		$order_id = absint( $wp->query_vars['order-received'] );
	} elseif ( is_checkout() && ! empty( $wp->request ) ) {
		$parts = explode( '/', trim( $wp->request, '/' ) );
		foreach ( $parts as $key => $part ) {
			if ( ( $part === 'order-received' || strpos( $wp->request, 'primljena' ) !== false ) && isset( $parts[ $key + 1 ] ) && is_numeric( $parts[ $key + 1 ] ) ) {
				$order_id = absint( $parts[ $key + 1 ] );
				break;
			}
		}
	}
	
	if ( ! $order_id && isset( $_GET['order-received'] ) ) {
		$order_id = absint( $_GET['order-received'] );
	} elseif ( ! $order_id && isset( $_GET['order'] ) ) {
		$order_id = absint( $_GET['order'] );
	}

	if ( ! $order_id || ! ($order = wc_get_order( $order_id )) ) {
		return '';
	}

	$order_key = isset( $_GET['key'] ) ? wc_clean( wp_unslash( $_GET['key'] ) ) : '';
	if ( $order->get_order_key() !== $order_key ) {
		return '<p class="woocommerce-error" style="text-align:center;">' . esc_html__( 'Invalid order.', 'woocommerce' ) . '</p>';
	}

	$is_failed = $order->has_status( array( 'failed', 'cancelled' ) );

	ob_start();
	?>
	<style type="text/css">
		.hpay-order-container {
			max-width: 800px;
			margin: 0 auto;
			padding: 10px 20px;
			text-align: left;
			box-sizing: border-box;
			line-height: 1.4 !important;
		}
		.hpay-text-before, .hpay-text-after {
			margin: 10px 0 !important;
		}
		.hpay-order-container h2, .hpay-order-container h3 {
			text-align: left;
			margin-top: 20px !important;
			margin-bottom: 10px !important;
			padding: 0 !important;
		}
		.hpay-order-container table.order_details {
			width: 100% !important;
			margin: 0 0 25px 0 !important;
			border-collapse: collapse !important;
		}
		.hpay-order-container table.order_details tr {
			margin: 0 !important;
			padding: 0 !important;
		}
		.hpay-order-container table.order_details th, 
		.hpay-order-container table.order_details td {
			text-align: left !important;
			padding: 8px 0px !important;
			line-height: 1.4 !important;
		}
		.hpay-order-container table.order_details th.product-total,
		.hpay-order-container table.order_details td.product-total,
		.hpay-order-container table.order_details tfoot td {
			text-align: right !important;
		}
		.hpay-addresses-flex {
			display: block !important; /* Promenjeno sa flex na čist block radi bolje kontrole visine */
			width: 100% !important;
			margin: 25px 0 40px 0 !important; /* DODATO: 40px margine na dnu gura sivu kutiju dole */
			clear: both !important;
		}
		.hpay-address-col {
			width: 100% !important;
			display: block !important;
			height: auto !important;
			margin-bottom: 20px !important;
		}
		/* Agresivna popravka za element koji curi van kontejnera */
		.hpay-address-col address {
			font-style: normal !important;
			line-height: 1.4 !important;
			margin: 0 0 20px 0 !important;
			padding: 0 !important;
			display: inline-block !important; /* Forsira element da zauzme tačnu visinu svog teksta */
			width: 100% !important;
			height: auto !important;
			min-height: 0 !important;
			position: relative !important;
			float: none !important;
		}
		.hpay-address-col address p,
		.hpay-address-col address span,
		.hpay-address-col address br {
			margin: 4px 0 0 0 !important;
			padding: 0 !important;
			display: block !important;
			height: auto !important;
			line-height: 1.4 !important;
		}
		.hpay-wrapped-content {
			margin-top: 30px !important;
			clear: both !important;
			display: block !important;
		}
	</style>

	<?php
	echo '<div class="hpay-order-container">';

	// Prikaz pre-tekstova
	if ( $is_failed && ! empty( $args['text_before_failed'] ) ) {
		echo '<div class="hpay-text-before failed">' . wp_kses_post( $args['text_before_failed'] ) . '</div>';
	} elseif ( ! $is_failed && ! empty( $args['text_before_success'] ) ) {
		echo '<div class="hpay-text-before success">' . wp_kses_post( $args['text_before_success'] ) . '</div>';
	}

	// 1. STAVKE, CENA, KOLIČINA I TOTAL
	if ( $args['show_items'] === '1' ) {
		?>
		<h2><?php echo esc_html( sprintf( __( 'Order #%s', 'woocommerce' ), $order->get_order_number() ) ); ?></h2>
		<table class="woocommerce-table woocommerce-table--order-details shop_table order_details">
			<thead>
				<tr>
					<th class="woocommerce-table__product-name product-name"><?php esc_html_e( 'Product', 'woocommerce' ); ?></th>
					<th class="woocommerce-table__product-table product-total"><?php esc_html_e( 'Total', 'woocommerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php
				foreach ( $order->get_items() as $item_id => $item ) {
					$product = $item->get_product();
					?>
					<tr class="woocommerce-table__line-item order_item">
						<td class="woocommerce-table__product-name product-name">
							<?php
							echo wp_kses_post( apply_filters( 'woocommerce_order_item_name', $item->get_name(), $item, false ) );
							echo ' <strong class="product-quantity">' . sprintf( '&times;&nbsp;%s', esc_html( $item->get_quantity() ) ) . '</strong>';
							?>
						</td>
						<td class="woocommerce-table__product-total product-total">
							<?php echo $order->get_item_subtotal( $item, false, true ); ?>
						</td>
					</tr>
					<?php
				}
				?>
			</tbody>
			<tfoot>
				<?php
				foreach ( $order->get_order_item_totals() as $key => $total ) {
					if ( $key === 'payment_method' && $args['show_payment_method'] !== '1' ) continue;
					if ( $key === 'shipping' && $args['show_shipping_method'] !== '1' ) continue;
					?>
					<tr>
						<th scope="row"><?php echo esc_html( $total['label'] ); ?></th>
						<td><?php echo wp_kses_post( $total['value'] ); ?></td>
					</tr>
					<?php
				}
				?>
			</tfoot>
		</table>
		<?php
	}

	// ADRESE
	if ( $args['show_billing'] === '1' || ( $args['show_shipping'] === '1' && $order->needs_shipping_address() ) ) {
		echo '<div class="hpay-addresses-flex">';
	}

	// 2. BILLING INFORMACIJE
	if ( $args['show_billing'] === '1' ) {
		?>
		<div class="hpay-address-col billing-address">
			<h3><?php esc_html_e( 'Billing address', 'woocommerce' ); ?></h3>
			<address>
				<?php echo wp_kses_post( $order->get_formatted_billing_address( esc_html__( 'N/A', 'woocommerce' ) ) ); ?>
				<?php if ( $order->get_billing_phone() ) : ?>
					<p class="woocommerce-customer-details--phone"><?php echo esc_html( $order->get_billing_phone() ); ?></p>
				<?php endif; ?>
				<?php if ( $order->get_billing_email() ) : ?>
					<p class="woocommerce-customer-details--email"><?php echo esc_html( $order->get_billing_email() ); ?></p>
				<?php endif; ?>
			</address>
		</div>
		<?php
	}

	// 3. SHIPPING INFORMACIJE
	if ( $args['show_shipping'] === '1' && $order->needs_shipping_address() ) {
		?>
		<div class="hpay-address-col shipping-address">
			<h3><?php esc_html_e( 'Shipping address', 'woocommerce' ); ?></h3>
			<address>
				<?php echo wp_kses_post( $order->get_formatted_shipping_address( esc_html__( 'N/A', 'woocommerce' ) ) ); ?>
			</address>
		</div>
		<?php
	}

	if ( $args['show_billing'] === '1' || ( $args['show_shipping'] === '1' && $order->needs_shipping_address() ) ) {
		echo '</div>'; 
	}

	// Metode ako tabela stavki nije uključena
	if ( $args['show_items'] !== '1' ) {
		if ( $args['show_payment_method'] === '1' ) {
			echo '<p style="margin: 5px 0 !important;"><strong>' . esc_html__( 'Payment method:', 'woocommerce' ) . '</strong> ' . esc_html( $order->get_payment_method_title() ) . '</p>';
		}
		if ( $args['show_shipping_method'] === '1' ) {
			echo '<p style="margin: 5px 0 !important;"><strong>' . esc_html__( 'Shipping:', 'woocommerce' ) . '</strong> ' . esc_html( $order->get_shipping_method() ) . '</p>';
		}
	}

	// Prikaz post-tekstova
	if ( $is_failed && ! empty( $args['text_after_failed'] ) ) {
		echo '<div class="hpay-text-after failed">' . wp_kses_post( $args['text_after_failed'] ) . '</div>';
	} elseif ( ! $is_failed && ! empty( $args['text_after_success'] ) ) {
		echo '<div class="hpay-text-after success">' . wp_kses_post( $args['text_after_success'] ) . '</div>';
	}

	// Sadržaj koji shortcode obmotava
	if ( ! is_null( $content ) ) {
		echo '<div class="hpay-wrapped-content">' . do_shortcode( $content ) . '</div>';
	}

	echo '</div>'; // Zatvaranje .hpay-order-container

	return ob_get_clean();
}

add_shortcode( 'hpay_show_order_details', 'hpay_order_details_shortcode' );


// 1. Add Metabox for Orders (shop_order) and Subscriptions (shop_subscription)
add_action( 'add_meta_boxes', 'hpay_wcs_add_overrides_metabox' );
function hpay_wcs_add_overrides_metabox() {
    try {
        $screen_types = array( 'shop_subscription', 'shop_order' );

        foreach ( $screen_types as $screen ) {
            add_meta_box(
                'hpay_wcs_start_date_box',
                __( 'Subscription / Order Overrides', 'holestpay' ),
                'hpay_wcs_render_overrides_metabox',
                $screen,
                'side',
                'default'
            );
        }
    } catch ( Throwable $ex ) {
        hpay_write_log( 'hpay_wcs_add_overrides_metabox', $ex );
    }
}

// 2. Render Metabox HTML Content
function hpay_wcs_render_overrides_metabox( $post ) {
    try {
        $post_type = get_post_type( $post->ID );

        // Security Nonce Field
        wp_nonce_field( 'hpay_wcs_save_start_date', 'hpay_wcs_start_date_nonce' );

        // --- IF TYPE IS SUBSCRIPTION (shop_subscription) ---
        if ( 'shop_subscription' === $post_type ) {
            $subscription = wcs_get_subscription( $post->ID );
            if ( $subscription ) {
                $start_date = $subscription->get_date( 'start' );
                $formatted_date = $start_date ? date( 'Y-m-d', wcs_date_to_time( $start_date ) ) : '';
                $is_manual_renewal = $subscription->get_requires_manual_renewal();

                // Field: Start Date
                echo '<p><label for="hpay_wcs_start_date"><strong>' . __( 'Start Date:', 'holestpay' ) . '</strong></label></p>';
                echo '<input type="text" class="date-picker hpay-datepicker" id="hpay_wcs_start_date" name="hpay_wcs_start_date" value="' . esc_attr( $formatted_date ) . '" placeholder="YYYY-MM-DD" style="width:100%;" />';
                
                echo '<hr style="margin: 12px 0; border: 0; border-top: 1px solid #ccc;" />';

                // Field: Manual Renewal Checkbox
                echo '<p>';
                echo '<label for="hpay_wcs_manual_renewal">';
                echo '<input type="checkbox" id="hpay_wcs_manual_renewal" name="hpay_wcs_manual_renewal" value="1" ' . checked( $is_manual_renewal, true, false ) . ' /> ';
                echo '<strong>' . __( 'Requires manual renewal (_requires_manual_renewal)', 'holestpay' ) . '</strong>';
                echo '</label>';
                echo '</p>';

                echo '<hr style="margin: 12px 0; border: 0; border-top: 1px solid #ccc;" />';
            }
        }

        // --- OPTION TO MUTE EMAILS (Common for Order and Subscription) ---
        $remaining_seconds = 0;
        $transient_key = 'hpay_mute_emails_' . $post->ID;
        $expiration_time = get_option( '_transient_timeout_' . $transient_key );
        
        if ( $expiration_time && $expiration_time > time() ) {
            $remaining_seconds = $expiration_time - time();
        }

        echo '<p><label for="hpay_mute_emails_duration"><strong>' . __( 'Block sending emails:', 'holestpay' ) . '</strong></label></p>';
        echo '<select id="hpay_mute_emails_duration" name="hpay_mute_emails_duration" style="width:100%;">';
        echo '<option value="0">' . __( '-- No blockage --', 'holestpay' ) . '</option>';
        echo '<option value="15">' . __( 'For next 15 seconds', 'holestpay' ) . '</option>';
        echo '<option value="30">' . __( 'For next 30 seconds', 'holestpay' ) . '</option>';
        echo '<option value="60">' . __( 'For next 1 minute', 'holestpay' ) . '</option>';
        echo '<option value="300">' . __( 'For next 5 minutes', 'holestpay' ) . '</option>';
        echo '</select>';

        if ( $remaining_seconds > 0 ) {
            echo '<p style="color: #d63638; font-weight: bold; margin-top: 5px; font-size: 12px;">';
            printf( __( '⚠️ Email blocking is active for the next %d seconds.', 'holestpay' ), $remaining_seconds );
            echo '</p>';
        }

        echo '<p class="description" style="margin-top:8px;">' . __( 'Modify settings and click "Update".', 'holestpay' ) . '</p>';

        // Script for jQuery Datepicker (Only if subscription)
        if ( 'shop_subscription' === $post_type ) {
            ?>
            <script type="text/javascript">
                jQuery(document).ready(function($) {
                    if ($.fn.datepicker) {
                        $('.hpay-datepicker').datepicker({
                            dateFormat: 'yy-mm-dd',
                            numberOfMonths: 1,
                            showButtonPanel: true
                        });
                    }
                });
            </script>
            <?php
        }

    } catch ( Throwable $ex ) {
        hpay_write_log( 'hpay_wcs_render_overrides_metabox', $ex );
    }
}

// 3. Save modified data (Works for both shop_subscription and shop_order)
add_action( 'save_post', 'hpay_wcs_save_overrides_data', 20, 2 );
function hpay_wcs_save_overrides_data( $post_id, $post ) {
    try {
        global $wpdb, $hpay_wcs_save_start_date_data_did_run;

        // Support only orders and subscriptions
        if ( ! in_array( $post->post_type, array( 'shop_subscription', 'shop_order' ), true ) ) {
            return;
        }

        if ( ! isset( $hpay_wcs_save_start_date_data_did_run ) ) {
            $hpay_wcs_save_start_date_data_did_run = array();
        }

        if ( isset( $hpay_wcs_save_start_date_data_did_run[ $post_id ] ) ) {
            return;
        }

        $hpay_wcs_save_start_date_data_did_run[ $post_id ] = true;

        // Verify Nonce
        if ( ! isset( $_POST['hpay_wcs_start_date_nonce'] ) || ! wp_verify_nonce( $_POST['hpay_wcs_start_date_nonce'], 'hpay_wcs_save_start_date' ) ) {
            return;
        }

        // Check for Autosave
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        // Check user permissions
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        // --- A) EMAIL MUTE LOGIC (Dropdown) ---
        if ( isset( $_POST['hpay_mute_emails_duration'] ) ) {
            $duration = intval( $_POST['hpay_mute_emails_duration'] );
            if ( $duration > 0 ) {
                set_transient( 'hpay_mute_emails_' . $post_id, true, $duration );
            }
        }

        // --- B) LOGIC ONLY FOR SUBSCRIPTIONS (shop_subscription) ---
        if ( 'shop_subscription' === $post->post_type ) {
            $subscription = wcs_get_subscription( $post_id );

            // 1. Update Start Date
            if ( isset( $_POST['hpay_wcs_start_date'] ) && ! empty( $_POST['hpay_wcs_start_date'] ) ) {
                $new_date = sanitize_text_field( $_POST['hpay_wcs_start_date'] );

                $site_timezone  = wp_timezone();
                $datetime_local = new DateTime( $new_date . ' 00:00:00', $site_timezone );

                $datetime_utc   = clone $datetime_local;
                $datetime_utc->setTimezone( new DateTimeZone( 'UTC' ) );

                $post_date     = $datetime_local->format( 'Y-m-d H:i:s' );
                $post_date_gmt = $datetime_utc->format( 'Y-m-d H:i:s' );

                $wpdb->update(
                    $wpdb->posts,
                    array(
                        'post_date'     => $post_date,
                        'post_date_gmt' => $post_date_gmt,
                    ),
                    array( 'ID' => $post_id ),
                    array( '%s', '%s' ),
                    array( '%d' )
                );

                if ( $subscription ) {
                    $subscription->set_date_created( $post_date_gmt );
                    $subscription->update_dates( array(
                        'start' => $post_date_gmt,
                    ) );
                }
            }

            // 2. Update _requires_manual_renewal
            if ( $subscription ) {
                $manual_renewal_val = isset( $_POST['hpay_wcs_manual_renewal'] ) ? 'true' : 'false';

                $subscription->update_meta_data( '_requires_manual_renewal', $manual_renewal_val );
                $subscription->save();

                update_post_meta( $post_id, '_requires_manual_renewal', $manual_renewal_val );
            }
        }

    } catch ( Throwable $ex ) {
        hpay_write_log( 'hpay_wcs_save_overrides_data', $ex );
    }
}

// 4. SUPPRESS EMAILS IF TRANSIENT IS ACTIVE
add_filter( 'woocommerce_email_recipient_customer_processing_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_customer_completed_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_customer_on_hold_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_customer_refunded_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_customer_invoice', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_new_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_cancelled_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_failed_order', 'hpay_suppress_emails_if_muted', 999, 3 );

// Additional filters for WooCommerce Subscriptions emails
add_filter( 'woocommerce_email_recipient_customer_completed_renewal_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_new_renewal_order', 'hpay_suppress_emails_if_muted', 999, 3 );
add_filter( 'woocommerce_email_recipient_customer_renewal_invoice', 'hpay_suppress_emails_if_muted', 999, 3 );

function hpay_suppress_emails_if_muted( $recipient, $object, $email ) {
    try {
        $order_id = 0;

        if ( is_a( $object, 'WC_Order' ) || is_a( $object, 'WC_Subscription' ) ) {
            $order_id = $object->get_id();
        } elseif ( is_numeric( $object ) ) {
            $order_id = $object;
        }

        if ( $order_id > 0 ) {
            if ( get_transient( 'hpay_mute_emails_' . $order_id ) ) {
                return ''; // Returning empty recipient cancels the email dispatch
            }
        }
    } catch ( Throwable $ex ) {
        hpay_write_log( 'hpay_suppress_emails_if_muted', $ex );
    }

    return $recipient;
}