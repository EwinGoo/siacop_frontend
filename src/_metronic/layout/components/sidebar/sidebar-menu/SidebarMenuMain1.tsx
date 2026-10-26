/* eslint-disable react/jsx-no-target-blank */
import React from 'react'
import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../helpers'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'
import { useAuth } from '../../../../../app/modules/auth'

const SidebarMenuMain = () => {
  const intl = useIntl()
  const {currentUser} =  useAuth()
  const menu = currentUser?.menu;
  // console.log(menu);
  
  return (
    <>
      {/* <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        fontIcon='bi-app-indicator'
      /> */}
      {/* <SidebarMenuItem to='/builder' icon='switch' title='Layout Builder' fontIcon='bi-layers' /> */}
      {/* <SidebarMenuItem
        to='/apps/gestion-persona'
        title='Personas'
        icon='profile-circle'
        fontIcon='bi-person'
      /> */}
      <SidebarMenuItem
        to='/apps/comisiones/listar'
        title='Permisos por Hora'
        icon='two-credit-cart'
        fontIcon='bi-person'
      />  
      <SidebarMenuItem
        to='/apps/asistencias-permisos/listar'
        title='Permisos por Día'
        icon='calendar-8'
        fontIcon='bi-person'
      />  
      <SidebarMenuItem
        to='/apps/comisiones/gestion-qr'
        title='Recepcionar por QR'
        icon='calendar-search'
        fontIcon='bi-person'
      />  
      <SidebarMenuItem
        to='/apps/declaratoria-comision/listar'
        title='Declaratoria Comisión'
        icon='security-user'
        fontIcon='bi-person'
      />
      <SidebarMenuItem
        to='/apps/feriados-asuetos/listar'
        title='Feriados & Asuetos'
        icon='element-7'
        fontIcon='bi-layers'
      />
      <SidebarMenuItem
        to='/apps/tipos-permisos/listar'
        title='Tipos de Permisos'
        icon='calendar-search'
        fontIcon='bi-person'
      />
      <SidebarMenuItemWithSub to='/apps/horarios' title='Horarios' fontIcon='bi-clock' icon='time'>
        <SidebarMenuItem to='/apps/horarios/tipos' title='Tipos de horario' hasBullet={true} />
        <SidebarMenuItem to='/apps/horarios/alternos' title='Horarios alternos' hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItem
        to='/apps/asistencia/listar'
        title='Asistencia'
        icon='element-plus'
        fontIcon='bi-archive'
      />
      <SidebarMenuItem
        to='/apps/biometrico/listar'
        title='Biometricos'
        icon='abstract-28'
        fontIcon='bi-layers'
      />
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Control Personal</span>
        </div>
      </div>
      <SidebarMenuItemWithSub to='/error' title='Comisiones' fontIcon='bi-person' icon='calendar-search'>
        <SidebarMenuItem to='/error/404' title='Error 404' hasBullet={true} />
        <SidebarMenuItem to='/error/500' title='Error 500' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub to='/error' title='Biometricos' fontIcon='bi-person' icon='faceid'>
        <SidebarMenuItem to='/apps/biometricos/dispositivos' title='Dispositivos' hasBullet={true} />
        <SidebarMenuItem to='/error/500' title='Error 500' hasBullet={true} />
      </SidebarMenuItemWithSub>

      {/* <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Crafted</span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to='/crafted/pages'
        title='Pages'
        fontIcon='bi-archive'
        icon='element-plus'
      >
        <SidebarMenuItemWithSub to='/crafted/pages/profile' title='Profile' hasBullet={true}>
          <SidebarMenuItem to='/crafted/pages/profile/overview' title='Overview' hasBullet={true} />
          <SidebarMenuItem to='/crafted/pages/profile/projects' title='Projects' hasBullet={true} />
          <SidebarMenuItem
            to='/crafted/pages/profile/campaigns'
            title='Campaigns'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/crafted/pages/profile/documents'
            title='Documents'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/crafted/pages/profile/connections'
            title='Connections'
            hasBullet={true}
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub to='/crafted/pages/wizards' title='Wizards' hasBullet={true}>
          <SidebarMenuItem
            to='/crafted/pages/wizards/horizontal'
            title='Horizontal'
            hasBullet={true}
          />
          <SidebarMenuItem to='/crafted/pages/wizards/vertical' title='Vertical' hasBullet={true} />
        </SidebarMenuItemWithSub>
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/crafted/accounts'
        title='Accounts'
        icon='profile-circle'
        fontIcon='bi-person'
      >
        <SidebarMenuItem to='/crafted/account/overview' title='Overview' hasBullet={true} />
        <SidebarMenuItem to='/crafted/account/settings' title='Settings' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub to='/error' title='Errors' fontIcon='bi-sticky' icon='cross-circle'>
        <SidebarMenuItem to='/error/404' title='Error 404' hasBullet={true} />
        <SidebarMenuItem to='/error/500' title='Error 500' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/crafted/widgets'
        title='Widgets'
        icon='element-7'
        fontIcon='bi-layers'
      >
        <SidebarMenuItem to='/crafted/widgets/lists' title='Lists' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/statistics' title='Statistics' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/charts' title='Charts' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/mixed' title='Mixed' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/tables' title='Tables' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/feeds' title='Feeds' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Apps</span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to='/apps/chat'
        title='Chat'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/apps/chat/private-chat' title='Private Chat' hasBullet={true} />
        <SidebarMenuItem to='/apps/chat/group-chat' title='Group Chart' hasBullet={true} />
        <SidebarMenuItem to='/apps/chat/drawer-chat' title='Drawer Chart' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItem
        to='/apps/user-management/users'
        icon='abstract-28'
        title='User management'
        fontIcon='bi-layers'
      />
      <div className='menu-item'>
        <a
          target='_blank'
          className='menu-link'
          href={process.env.REACT_APP_PREVIEW_DOCS_URL + '/docs/changelog'}
        >
          <span className='menu-icon'>
            <KTIcon iconName='code' className='fs-2' />
          </span>
          <span className='menu-title'>Changelog {process.env.REACT_APP_VERSION}</span>
        </a>
      </div> */}
    </>
  )
}

export {SidebarMenuMain}
