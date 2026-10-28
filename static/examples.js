'use strict';
// Add fictional examples without changing the questionnaire or routing contracts.
// Loaded after app.js; examples is that controller's existing mutable catalogue.
(function () {
 const additions = [
  ['shared_banking', 'Shared OTP, PIN or card details', {
   facts:{...base,suspected_fraud:'yes',credentials_exposed:'yes',remote_access:'no',bank_reported:'no',official_reported:'no'},
   amount:'',notes:'Fictional demo: A caller claimed to be bank support and I shared banking credentials. I have not yet checked whether money left my account.'
  }],
  ['remote_device', 'Installed a remote-access app / shared my screen', {
   facts:{...base,suspected_fraud:'yes',remote_access:'yes',bank_reported:'no',official_reported:'no'},
   amount:'',notes:'Fictional demo: A supposed support agent asked me to install a remote-access app and share my screen. I do not yet know whether credentials or money were affected.'
  }],
  ['unrecognized_debit', 'Unrecognised card or net-banking transaction', {
   facts:{...base,money_moved:'yes',remote_access:'no',bank_reported:'no',official_reported:'no'},
   amount:'',notes:'Fictional demo: I found a debit I do not recognise. I need to verify its payment method and whether it is unauthorised; I have not confirmed fraud.'
  }],
  ['fake_scheme', 'Suspected fake job, investment or trading scheme', {
   facts:{...base,suspected_fraud:'yes',money_moved:'yes',payment_channel:'bank_transfer',credentials_exposed:'no',remote_access:'no',bank_reported:'no',official_reported:'no'},
   amount:'',notes:'Fictional demo: I sent a bank transfer to a supposed investment scheme. They now demand another fee before allowing a withdrawal. I suspect deception.'
  }],
  ['account_takeover', 'Social media, email or bank login compromised', {
   facts:{...base,suspected_fraud:'yes',money_moved:'no',credentials_exposed:'yes',remote_access:'no',bank_reported:'no',official_reported:'no'},
   amount:'',notes:'Fictional demo: My email password was changed without my permission. No known money has moved. This example concerns email access; banking exposure has not been established.'
  }],
  ['possible_sim_swap', 'Phone lost signal — possible SIM swap (unconfirmed)', {
   facts:{...base,bank_reported:'no',official_reported:'no'},
   amount:'',notes:'Fictional demo: My phone suddenly lost mobile signal. I do not know the cause or whether any account is affected. Signal loss alone does not confirm SIM swap or fraud. This prototype has no SIM-specific recovery workflow.'
  }]
 ];
 const select=document.getElementById('demo');
 if(!select)return;
 for(const [id,label,sample] of additions){
  examples[id]=sample;
  const option=document.createElement('option');option.value=id;option.textContent=label;select.append(option);
 }
})();
