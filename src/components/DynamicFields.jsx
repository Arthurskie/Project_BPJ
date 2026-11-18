const inputClass='w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-red-600';
export default function DynamicFields({ fields, answers, onChange, errors={}, disabled=false }) {
 return [...fields].sort((a,b)=>a.urutan-b.urutan).map(field=>{
  const key=field.field_key, id=`dynamic-${key}`, error=errors[key];
  const props={id,name:key,placeholder:field.placeholder,required:field.wajib,disabled,'aria-invalid':Boolean(error),'aria-describedby':error?`${id}-error`:undefined,className:inputClass,value:answers[key]??'',onChange:e=>onChange(key,field.tipe_input==='number' && e.target.value!==''?Number(e.target.value):e.target.value)};
  return <div key={key} className="space-y-1.5"><label htmlFor={id} className="block text-sm font-semibold text-slate-700">{field.label}{field.wajib?' *':''}</label>{field.tipe_input==='select'?<select {...props}><option value="">Pilih {field.label}</option>{(field.opsi||[]).map(option=><option key={option} value={option}>{option}</option>)}</select>:field.tipe_input==='textarea'?<textarea {...props} maxLength={field.panjang_maksimum} rows={3}/>:<input {...props} type={field.tipe_input} maxLength={field.panjang_maksimum} step={field.tipe_input==='number'?'any':undefined}/>} {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-700">{error}</p>}</div>;
 });
}
