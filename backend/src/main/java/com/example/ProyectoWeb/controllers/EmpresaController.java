package com.example.ProyectoWeb.controllers;

import com.example.ProyectoWeb.entity.Empresa;
import com.example.ProyectoWeb.services.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/empresas")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    @PostMapping
    public Empresa crearEmpresa(@RequestBody Empresa empresa) {
        return empresaService.save(empresa);
    }

    @GetMapping
    public List<Empresa> listarEmpresas() {
        return empresaService.findAll();
    }

    @GetMapping("/{id}")
    public Empresa obtenerEmpresa(@PathVariable Long id) {
        return empresaService.findById(id).orElse(null);
    }
}