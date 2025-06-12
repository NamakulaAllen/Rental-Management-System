// Copyright (c) 2025, Allen and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Invoice", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Sales Invoice', {

    
    refresh: function(frm) {
       
        this.toggle_due_date_field(frm);

        
        this.add_reminder_button(frm);
    },

    
    toggle_due_date_field: function(frm) {
       
        if (frm.doc.status === 'Paid') {
            
            frm.toggle_display('due_date', false);
        } else {
           
            frm.toggle_display('due_date', true);
        }
    },

    
    add_reminder_button: function(frm) {
        
        frm.remove_custom_button('Send Reminder');

       
        if (frm.doc.docstatus === 1 && frm.doc.status !== 'Paid') {
           
            frm.add_custom_button(__('Send Reminder'), function() {
                
                frappe.msgprint(__('Preparing email reminder...'));

                
                frappe.call({
                    
                    method: "frappe.core.doctype.communication.email.make",
                    args: {
                        doctype: 'Sales Invoice',
                        name: frm.doc.name, 
                        recipients: frm.doc.customer_email, 
                        subject: `Reminder: Invoice ${frm.doc.name} for ${frm.doc.customer_name}`,
                        content: `Dear ${frm.doc.customer_name},<br><br>This is a friendly reminder that your invoice is due. Please find the details attached.<br><br>Thank you,<br>The Management`,
                        send_email: 1, 
                        attach_print: true 
                    },
                    callback: function(r) {
                       
                        if (!r.exc) { 
                            frappe.msgprint({
                                title: __('Email Sent'),
                                message: __('Email reminder sent successfully to {0}', [frm.doc.customer_email]),
                                indicator: 'green'
                            });
                        }
                       
                    }
                });
            }).addClass("btn-primary");
        }
    }
});